export default function DetectionBox({

  left,

  top,

  width,

  height,

  label,

  color="border-lime-400"

}){

  return(

    <div

      className={`

        absolute

        ${color}

        border-2

      `}

      style={{

        left,

        top,

        width,

        height

      }}

    >

      <div

        className="
          absolute

          -top-7

          left-0

          rounded

          bg-lime-400

          px-2

          py-1

          text-xs

          font-bold

          text-black
        "

      >

        {label}

      </div>

    </div>

  );

}