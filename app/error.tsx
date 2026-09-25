"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return <section className="error-page section-wrap"><div><h1>Something went wrong</h1><button onClick={reset}>Try again</button></div></section>;
}
