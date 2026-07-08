import Image from "next/image";

import { Button } from "@/components/button/button";
import { Logo } from "@/components/logo";
import { NavBar } from "@/components/navigation/navbar";
import {
  architectureFlow,
  footerLinks,
  homepageTaskTypes,
  liveUpdateFlow,
  productFlow,
  techStack,
} from "@/constants/home";

import styles from "./duck.module.css";

export default function Home() {
  return (
    <main className="min-h-screen bg-neutral-50 text-neutral-950">
      <NavBar />

      <section className="bg-white">
        <div className="mx-auto flex min-h-[560px] max-w-6xl items-center justify-between gap-10 px-6 py-10 lg:py-14">
          <div className="max-w-3xl">
            <Logo />

            <h1 className="mt-4 max-w-3xl text-4xl leading-tight tracking-normal text-neutral-950 sm:text-5xl">
              Create a workflow, run it, and watch the backend process each
              task.
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-neutral-600">
              Monad is a small workflow orchestration app. It turns repeatable
              backend jobs into saved workflows that can be executed and
              inspected from a dashboard.
            </p>

            <Button name="Open Workflows" />
          </div>

          <a href="https://eliaslarsson.dev" className={styles.duckWrap}>
            <Image
              src="/duck.png"
              alt="Monad duck"
              width={144}
              height={144}
              className={styles.duck}
            />
          </a>
        </div>
      </section>

      <section className="border-y border-neutral-200 bg-neutral-50">
        <div className="mx-auto grid max-w-6xl gap-8 px-6 py-16 lg:grid-cols-[minmax(260px,360px)_minmax(0,1fr)] lg:items-start lg:py-20">
          <div className="max-w-sm">
            <p className="text-sm font-medium text-neutral-500">
              Why I built this
            </p>
            <h2 className="mt-3 text-3xl leading-tight text-neutral-950">
              Built to make backend engineering visible.
            </h2>
          </div>

          <div className="max-w-3xl lg:pt-8">
            <p className="text-lg leading-8 text-neutral-600">
              I built Monad to demonstrate that I can take a complex backend
              idea and turn it into a working product. The project is designed
              for people reviewing my work on LinkedIn or my portfolio: it
              makes the system architecture, execution flow, and engineering
              decisions visible instead of hiding them behind a simple UI.
            </p>

            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-4">
              {techStack.map((item) => (
                <div
                  key={item.label}
                  className="flex min-w-0 items-center gap-2 text-neutral-700"
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="h-5 w-5 shrink-0"
                    fill={item.color}
                    aria-hidden="true"
                  >
                    <path d={item.icon.path} />
                  </svg>
                  <span className="text-sm font-medium">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-neutral-200 bg-white">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 lg:grid-cols-[320px_1fr] lg:py-20">
          <div>
            <p className="text-sm font-medium text-neutral-500">
              Product flow
            </p>
            <h2 className="mt-3 text-3xl leading-tight text-neutral-950">
              The app follows one simple path.
            </h2>
            <p className="mt-4 leading-7 text-neutral-600">
              Think of Monad as a place to define repeatable work, trigger it,
              and see what happened.
            </p>
          </div>

          <div className="space-y-4">
            {productFlow.map((item) => (
              <article
                key={item.step}
                className="grid gap-4 rounded-lg border border-neutral-200 bg-neutral-50 p-5 sm:grid-cols-[96px_1fr]"
              >
                <div>
                  <p className="text-sm font-semibold text-neutral-400">
                    {item.step}
                  </p>
                  <p className="mt-1 text-sm font-medium text-neutral-700">
                    {item.label}
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-neutral-950">
                    {item.title}
                  </h3>
                  <p className="mt-2 leading-7 text-neutral-600">
                    {item.description}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16 lg:py-20">
        <div className="max-w-3xl">
          <p className="text-sm font-medium text-neutral-500">
            Architecture flow
          </p>
          <h2 className="mt-3 text-3xl leading-tight text-neutral-950">
            What happens after a workflow run starts.
          </h2>
          <p className="mt-4 leading-7 text-neutral-600">
            Monad keeps execution separate from the API. The API records the
            run and queues work, while workers handle the actual task execution.
          </p>
        </div>

        <div className="mt-10 rounded-xl border border-neutral-200 bg-white p-4 sm:p-6">
          <div>
            <p className="text-sm font-semibold text-neutral-500">
              Execution path
            </p>

            <div className="mt-4 grid min-w-0 gap-0 lg:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr_auto_1fr] lg:items-stretch">
              {architectureFlow.map((item, index) => (
                <div key={item.title} className="contents">
                  <div className="min-w-0">
                    <article
                      className={`flex h-full min-w-0 flex-col rounded-lg border p-5 ${item.tone}`}
                    >
                      <p className="text-sm font-semibold">
                        {String(index + 1).padStart(2, "0")}
                      </p>
                      <h3 className="mt-3 text-xl font-semibold">
                        {item.title}
                      </h3>
                      <p className="mt-1 text-sm font-semibold opacity-70">
                        {item.role}
                      </p>
                      <p className="mt-4 leading-7">{item.description}</p>
                    </article>
                  </div>

                  {index < architectureFlow.length - 1 ? (
                    <div className="flex h-10 items-center justify-center lg:h-auto lg:w-8">
                      <div className="h-full w-px bg-neutral-300 lg:h-px lg:w-full" />
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </div>

          <div className="my-8 border-t border-dashed border-neutral-200" />

          <div>
            <p className="text-sm font-semibold text-neutral-500">
              Live update path
            </p>

            <div className="mt-4 grid min-w-0 gap-0 lg:grid-cols-[1fr_auto_1fr_auto_1fr] lg:items-stretch">
              {liveUpdateFlow.map((item, index) => (
                <div key={item.title} className="contents">
                  <div className="min-w-0">
                    <article
                      className={`flex h-full min-w-0 flex-col rounded-lg border p-5 ${item.tone}`}
                    >
                      <p className="text-sm font-semibold">
                        {String(index + 1).padStart(2, "0")}
                      </p>
                      <h3 className="mt-3 text-xl font-semibold">
                        {item.title}
                      </h3>
                      <p className="mt-1 text-sm font-semibold opacity-70">
                        {item.role}
                      </p>
                      <p className="mt-4 leading-7">{item.description}</p>
                    </article>
                  </div>

                  {index < liveUpdateFlow.length - 1 ? (
                    <div className="flex h-10 items-center justify-center lg:h-auto lg:w-8">
                      <div className="h-full w-px bg-neutral-300 lg:h-px lg:w-full" />
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-neutral-200 bg-white">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 lg:grid-cols-[320px_1fr] lg:py-20">
          <div>
            <p className="text-sm font-medium text-neutral-500">
              Task types
            </p>
            <h2 className="mt-3 text-3xl leading-tight text-neutral-950">
              Workflows are built from small backend tasks.
            </h2>
            <p className="mt-4 leading-7 text-neutral-600">
              Each task is executed by a Go worker. The API creates the run,
              RabbitMQ queues the next task, and Postgres stores the final
              status and output.
            </p>
          </div>

          <div className="grid min-w-0 gap-4 md:grid-cols-2">
            {homepageTaskTypes.map((task) => (
              <article
                key={task.title}
                className="min-w-0 rounded-lg border border-neutral-200 bg-neutral-50 p-5"
              >
                <h3 className="text-xl font-semibold text-neutral-950">
                  {task.title}
                </h3>
                <p className="mt-3 leading-7 text-neutral-600">
                  {task.description}
                </p>
                <pre className="mt-4 max-w-full whitespace-pre-wrap break-words rounded-md border border-neutral-200 bg-white p-3 text-xs text-neutral-700">
                  {task.example}
                </pre>
              </article>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-neutral-200">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-8 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Image
              src="/duck.svg"
              alt="Monad duck"
              width={56}
              height={56}
              className="rotate-6"
            />
            <div>
              <h1 className="font-semibold text-neutral-950">Monad</h1>
              <p className="mt-1 text-sm text-neutral-500">
                Built by Elias Larsson.
              </p>
            </div>
          </div>

          <nav
            aria-label="Footer navigation"
            className="flex flex-wrap gap-3 text-sm font-medium"
          >
            {footerLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noreferrer"
                className="rounded-md border border-neutral-200 px-3 py-2 text-neutral-700 hover:bg-neutral-50 hover:text-neutral-950"
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>
      </footer>
    </main>
  );
}
