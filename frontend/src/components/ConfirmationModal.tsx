import { PropsWithChildren } from "react";

interface ConfirmationModalProps extends PropsWithChildren {
    showModal: boolean;
    closeModal:  () => void;
    boxWidth?: string;
    image?: string;
    imageWidth?: string;
    imageHeight?: string;
}

export default function ConfirmationModal(props: ConfirmationModalProps) {
    return props.showModal && <div className="fixed inset-0 bg-gray-400 bg-opacity-15 flex justify-center items-center z-50 backdrop-blur-md">
        <div className={`bg-white p-5 pt-12 pb-6 rounded-xl relative ${props.boxWidth ?? "max-w-[320px]"} h-max shadow-md flex flex-col justify-center text-center`}>
            {/* Close button */}
            <button className="absolute top-0 right-0 mr-4 mt-2 text-gray-600 text-3xl font-semibold" onClick={props.closeModal}>&times;</button>
            {/* Image */}
            {props.image && <div className={`${props.imageWidth ?? "max-w-[200px]"} ${props.imageHeight ?? "h-[120px]"} self-center justify-center flex items-center`}>
                <img src={props.image} alt="image" className="w-full h-full" />
            </div>}
            {props.children}
        </div>
    </div>
}