import Link from "next/link";
type Props = {
  name: string;
};
export const Button = ({ name }: Props) => {
  return (
    <div className="mt-6 flex flex-wrap gap-3">
      <Link
        href="/dashboard"
        className="rounded-md bg-neutral-950 px-4 py-2 font-medium text-white hover:bg-neutral-800"
      >
        {name}
      </Link>
    </div>
  );
};
