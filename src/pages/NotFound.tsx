export default function NotFound({ home }: { home: () => void }) {
  return (
    <div className="mx-auto max-w-xl py-16 text-center">
      <p className="label text-muted-foreground">404</p>
      <h1 className="display mt-2 text-6xl">Off the path.</h1>
      <p className="mt-4 text-muted-foreground">That page does not exist. Your data is untouched.</p>
      <button onClick={home} className="mt-8 cursor-pointer rounded-full bg-primary px-6 py-3 font-medium text-primary-foreground">Back to the dashboard</button>
    </div>
  );
}
