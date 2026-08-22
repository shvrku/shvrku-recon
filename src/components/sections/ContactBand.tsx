"use client";

import { site } from "@/lib/site";
import { ScrambleText } from "@/components/chrome/ScrambleText";

export function ContactBand() {
  return (
    <section className="py-24 lg:py-32">
      <div className="layout-grid w-full text-left">
        <p
          data-rise
          className="col-span-2 text-[7.2svw] leading-none font-bold uppercase lg:col-span-3 lg:text-[5vw]"
        >
          <ScrambleText inView text="Let's create" as="span" />
          <span className="mt-2 block">
            <ScrambleText inView delay={90} text="something" />
          </span>
          <span className="mt-2 block">
            <ScrambleText inView delay={150} text="extraordinary" />
          </span>
        </p>
      </div>
      <div className="layout-grid mt-10">
        <div className="col-span-2 lg:col-span-3" data-rise>
          <p className="font-mono text-xs uppercase tracking-[0.16em] opacity-50">
            {site.brand}©{site.year}
          </p>
          <a
            href={`mailto:${site.email}`}
            className="hit-dash mt-4 inline-block w-fit font-mono text-sm underline"
          >
            <ScrambleText inView text={site.email} />
          </a>
        </div>
      </div>
    </section>
  );
}
