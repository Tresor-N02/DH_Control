import {
    Plus,
    Minus,
    LocateFixed,
    Layers3
} from "lucide-react";

export default function MapToolbar(){

    return(

        <div
            className="
                absolute

                right-3

                top-3

                z-[1000]

                flex

                flex-col

                gap-2
            "
        >

            <ToolButton icon={Plus}/>

            <ToolButton icon={Minus}/>

            <ToolButton icon={LocateFixed}/>

            <ToolButton icon={Layers3}/>

        </div>

    );

}

function ToolButton({icon:Icon}){

    return(

        <button

            className="
                flex

                h-10
                w-10

                items-center
                justify-center

                rounded-lg

                bg-slate-900/90

                border

                border-slate-700

                hover:bg-cyan-600

                transition
            "

        >

            <Icon size={18}/>

        </button>

    );

}