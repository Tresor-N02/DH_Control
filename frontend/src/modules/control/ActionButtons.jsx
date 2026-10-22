import {
  PlaneTakeoff,
  PlaneLanding,
  House,
  OctagonX,
} from "lucide-react";

import { useDrone } from "../../context/DroneContext";

export default function ActionButtons() {

  const {

    takeOff,

    land,

    returnHome,

    emergencyStop,

  } = useDrone();

  return (

    <div className="rounded-xl border border-slate-800 bg-slate-900 p-3">

      <h3 className="mb-2 text-sm font-semibold">

        Commandes rapides

      </h3>

      <div className="grid grid-cols-2 gap-2">

        <Button
          icon={PlaneTakeoff}
          title="Décoller"
          color="bg-emerald-600 hover:bg-emerald-500"
          onClick={takeOff}
        />

        <Button
          icon={PlaneLanding}
          title="Atterrir"
          color="bg-sky-600 hover:bg-sky-500"
          onClick={land}
        />

        <Button
          icon={House}
          title="Retour"
          color="bg-indigo-600 hover:bg-indigo-500"
          onClick={returnHome}
        />

        <Button
          icon={OctagonX}
          title="Urgence"
          color="bg-red-600 hover:bg-red-500"
          onClick={emergencyStop}
        />

      </div>

    </div>

  );

}

function Button({

  icon: Icon,

  title,

  color,

  onClick,

}) {

  return (

    <button

      onClick={onClick}

      className={`
        ${color}

        rounded-xl

        p-3

        flex

        flex-col

        items-center

        justify-center

        transition

        hover:scale-105
      `}
    >

      <Icon size={20} />

      <span className="mt-2 text-sm font-medium">

        {title}

      </span>

    </button>

  );

}