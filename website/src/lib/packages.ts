import fs from 'node:fs';
import path from 'node:path';
import {unified} from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkEmoji from 'remark-emoji';
import {remarkAlert} from 'remark-github-blockquote-alert';
import remarkRehype from 'remark-rehype';
import rehypeRaw from 'rehype-raw';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeSanitize, {defaultSchema} from 'rehype-sanitize';
import rehypeShiki from '@shikijs/rehype';
import rehypeStringify from 'rehype-stringify';
import packagesData from '../../../data/packages.json';

export interface Package {
    name: string;
    url: string;
    description: string;
    stars: number;
    forks: number;
    topics: string[];
    language: string | null;
    license: string | null;
    created_at: string;
    updated_at: string;
    pushed_at: string;
    discovered_at: string;
}

const READMES_DIR = path.resolve(process.cwd(), '../data/readmes');

const sanitizeSchema = {
    ...defaultSchema,
    attributes: {
        ...defaultSchema.attributes,
        '*': [
            ...(defaultSchema.attributes?.['*'] ?? []),
            'className',
            'style',
        ],
        code: [
            ...(defaultSchema.attributes?.code ?? []),
            'className',
        ],
        span: [
            ...(defaultSchema.attributes?.span ?? []),
            'className',
            'style',
        ],
        pre: [
            ...(defaultSchema.attributes?.pre ?? []),
            'className',
            'style',
            'tabindex',
        ],
        a: [
            // Strip the default value-restricted className tuple
            ...((defaultSchema.attributes?.a ?? []).filter(
                (entry) => !(Array.isArray(entry) && entry[0] === 'className'),
            )),
            'className',
            'target',
            'rel',
            'ariaHidden',
            'tabIndex',
        ],
        img: [
            ...(defaultSchema.attributes?.img ?? []),
            'loading',
            'decoding',
        ],
        div: [
            ...(defaultSchema.attributes?.div ?? []),
            'className',
        ],
        svg: ['className', 'viewBox', 'width', 'height', 'fill', 'aria-hidden', 'xmlns'],
        path: ['d', 'fillRule', 'clipRule'],
    },
    tagNames: [
        ...(defaultSchema.tagNames ?? []),
        'details',
        'summary',
        'kbd',
        'sub',
        'sup',
        'mark',
        'svg',
        'path',
    ],
};

const processor = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkAlert)
    .use(remarkEmoji as any)
    .use(remarkRehype, {allowDangerousHtml: true})
    .use(rehypeRaw)
    .use(rehypeSlug)
    .use(rehypeAutolinkHeadings, {
        behavior: 'prepend',
        properties: {
            className: ['heading-anchor'],
            ariaHidden: 'true',
            tabIndex: -1,
        },
        content: {
            type: 'element',
            tagName: 'span',
            properties: {className: ['heading-anchor-icon']},
            children: [{type: 'text', value: '#'}],
        },
    })
    .use(rehypeSanitize, sanitizeSchema)
    .use(rehypeShiki, {
        themes: {light: 'github-light', dark: 'github-dark'},
        defaultColor: 'light',
    });

const stringifier = unified().use(rehypeStringify);

export const allPackages: Package[] = Object.values(packagesData) as Package[];

export function readmeFilename(name: string): string {
    return name.replace('/', '--') + '.md';
}

export function loadReadme(name: string): string | null {
    const file = path.join(READMES_DIR, readmeFilename(name));
    if (!fs.existsSync(file)) return null;
    const content = fs.readFileSync(file, 'utf8');
    if (!content.trim()) return null;
    return content;
}

export async function renderReadme(name: string, raw: string): Promise<string> {
    const tree = await processor.run(processor.parse(raw));
    let html = stringifier.stringify(tree) as string;

    const repoBlobBase = `https://github.com/${name}/blob/HEAD/`;
    const repoRawBase = `https://raw.githubusercontent.com/${name}/HEAD/`;

    html = html.replace(
        /<img([^>]*?)\ssrc="(?!https?:|\/\/|data:|#)([^"]+)"/gi,
        (_m, attrs, src) => `<img${attrs} src="${repoRawBase}${src.replace(/^\.?\//, '')}"`,
    );

    html = html.replace(
        /<a([^>]*?)\shref="(?!https?:|\/\/|mailto:|#)([^"]+)"/gi,
        (_m, attrs, href) =>
            `<a${attrs} href="${repoBlobBase}${href.replace(/^\.?\//, '')}" target="_blank" rel="noopener"`,
    );

    return html;
}

export interface PackageDetail extends Package {
    readme_html: string | null;
}

export async function buildDetail(pkg: Package): Promise<PackageDetail> {
    const raw = loadReadme(pkg.name);
    return {
        ...pkg,
        readme_html: raw ? await renderReadme(pkg.name, raw) : null,
    };
}
