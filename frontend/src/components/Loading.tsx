import { Spinner } from "flowbite-react";

interface LoadingProps {
    className: string;
}
export default function Loading({ className }: LoadingProps) {
    return <div className={`flex justify-center text-center ${className}`}>
        <div>
            <Spinner size="xl" className="mb-2 fill-secondary" />
            <h1 className="text-xl text-gray-500 font-semibold">Please Wait...</h1>
            <p className="text-gray-400 text-lg">while we fetch information for you.</p>
        </div>
    </div>
}