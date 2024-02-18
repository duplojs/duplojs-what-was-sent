import {AbstractRoute, DuploConfig, DuploInstance, Response, zod} from "@duplojs/duplojs";
import packageJson from "../package.json";
import {injecter} from "./injecter";

declare module "@duplojs/duplojs" {
    interface Plugins{
        "@duplojs/what-was-sent": {version: string}
    }
}

export class IHaveSentThis{
	constructor(
		public code: number,
		public zodType: zod.ZodType = zod.undefined()
	){}
}

export default function duploWhatWasSent(instance: DuploInstance<DuploConfig>){
	instance.plugins["@duplojs/what-was-sent"] = {version: packageJson.version};

	if(instance.config.environment != "DEV") return;

	instance.addHook("beforeBuildRouter", () => {
		instance.processes.forEach(injecter);
		instance.abstractRoutes.forEach(ar => {
			if(ar instanceof AbstractRoute){
				injecter(ar);
			}
		});
		Object.values(instance.routes).flat().forEach(injecter);
	});
}
