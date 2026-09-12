import { t } from '@/lib/i18n';
import { guideSections, type GuideBlock } from '@/lib/guide/content';
import type { Language } from '@/lib/schema';

function Block({ block }: { block: GuideBlock }) {
  if (block.kind === 'text') {
    return <p className="mb-4 leading-relaxed text-neutral-300">{block.body}</p>;
  }

  if (block.kind === 'note') {
    return (
      <p className="mb-4 border-l-2 border-neutral-700 pl-4 leading-relaxed text-neutral-400">
        {block.body}
      </p>
    );
  }

  if (block.kind === 'list') {
    return (
      <ul className="mb-4 space-y-2">
        {block.items.map((item, index) => (
          <li key={index} className="flex gap-3 leading-relaxed text-neutral-300">
            <span aria-hidden className="mt-2 h-1 w-1 shrink-0 rounded-full bg-neutral-600" />
            {item}
          </li>
        ))}
      </ul>
    );
  }

  return (
    <ol className="mb-4 space-y-2">
      {block.items.map((item, index) => (
        <li key={index} className="flex gap-3 leading-relaxed text-neutral-300">
          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-neutral-800 text-xs text-neutral-400">
            {index + 1}
          </span>
          {item}
        </li>
      ))}
    </ol>
  );
}

export function GuideView({ language }: { language: Language }) {
  const dict = t(language);
  const sections = guideSections(language);

  return (
    <main className="mx-auto max-w-3xl p-8">
      <h1 className="mb-2 text-2xl font-semibold">{dict.guideTitle}</h1>
      <p className="mb-10 text-sm text-neutral-500">{dict.guideIntro}</p>

      <nav className="mb-12 rounded border border-neutral-900 p-5">
        <h2 className="mb-3 text-xs uppercase tracking-wide text-neutral-500">
          {dict.guideContents}
        </h2>
        <ol className="space-y-1 text-sm">
          {sections.map((section, index) => (
            <li key={section.id}>
              <a
                href={`#${section.id}`}
                className="text-neutral-400 transition-colors hover:text-neutral-100"
              >
                <span className="mr-2 tabular-nums text-neutral-600">{index + 1}</span>
                {section.title}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      {sections.map((section) => (
        <section key={section.id} id={section.id} className="mb-12 scroll-mt-20">
          <h2 className="mb-4 text-lg font-semibold text-neutral-100">{section.title}</h2>
          {section.blocks.map((block, index) => (
            <Block key={index} block={block} />
          ))}
        </section>
      ))}
    </main>
  );
}
