import Link from "next/link";
type Props = {
  name: string;
};
export const Button = ({ name }: Props) => {
  return (
    <div className="mt-6 flex flex-wrap gap-3">
      <Link
        href="/workflows"
        className="
        rounded-md bg-neutral-950 px-4 py-2 font-medium text-white border-black border-2 transition duration-100
        hover:bg-white hover:text-black 
        "
      >
        {name}
      </Link>
    </div>
  );
};
