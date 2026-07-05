import { describe, expect, it, vi } from 'vitest';
import {
  applyConvertors,
  buildConvertors,
  generateComponent,
  getComponentByType,
  getCorrespondingComponentFileTypes,
} from './generateComponentUtils.js';

describe('buildConvertors', () => {
  it('produces every supported name casing', () => {
    const c = buildConvertors('my-widget');

    expect(c.templatename).toBe('my-widget');
    expect(c.TemplateName).toBe('MyWidget');
    expect(c.templateName).toBe('myWidget');
    expect(c['template-name']).toBe('my-widget');
    expect(c.template_name).toBe('my_widget');
    expect(c.TEMPLATE_NAME).toBe('MY_WIDGET');
    expect(c.TEMPLATENAME).toBe('MY-WIDGET');
  });
});

describe('applyConvertors', () => {
  it('replaces all placeholders in a template', () => {
    const out = applyConvertors('const templatename = <TemplateName />;', buildConvertors('box'));
    expect(out).toBe('const box = <Box />;');
  });
});

describe('getCorrespondingComponentFileTypes', () => {
  it('returns only keys starting with "with"', () => {
    const result = getCorrespondingComponentFileTypes({
      path: 'src/components',
      withStyle: true,
      withTest: false,
      customDirectory: 'X',
    });

    expect(result).toEqual(['withStyle', 'withTest']);
  });
});

describe('getComponentByType', () => {
  const config = {
    component: {
      default: { path: 'src/components' },
      page: { path: 'src/pages' },
    },
  };

  it('returns the default type when no --type is passed', () => {
    expect(getComponentByType(['node', 'casting', 'component', 'Box'], config)).toBe(config.component.default);
  });

  it('returns the requested type', () => {
    expect(getComponentByType(['node', 'casting', 'component', 'Home', '--type=page'], config)).toBe(
      config.component.page,
    );
  });
});

describe('generateComponent (dry-run)', () => {
  it('reports files without writing them', async () => {
    vi.spyOn(console, 'log').mockImplementation(() => {});

    const config = {
      usesTypeScript: false,
      usesCssModule: false,
      cssPreprocessor: 'css',
      testLibrary: 'Testing Library',
      component: { default: { path: 'src/components' } },
    };

    const cmd = {
      path: 'src/components',
      type: 'default',
      flat: false,
      dryRun: true,
      withStyle: true,
      withTest: true,
    };

    const files = await generateComponent('DryRunWidget', cmd, config);
    const names = files.map(f => f.filename);

    expect(names).toContain('DryRunWidget.js');
    expect(names).toContain('DryRunWidget.css');
    expect(names).toContain('DryRunWidget.test.js');
    expect(files.every(f => f.status === 'created')).toBe(true);

    vi.restoreAllMocks();
  });
});
