import {AbstractRoute, DuploConfig, DuploInstance, Response, zod} from "@duplojs/duplojs";
import packageJson from "../package.json";
import {injecter} from "./injecter";
import {info} from "console";

declare module "@duplojs/duplojs" {
    interface Plugins{
        "@duplojs/what-was-sent": {version: string}
    }
}

export class IHaveSentThis{
	public zod: zod.ZodType;
	public info?: string[] = undefined;

	constructor(code: number, zod?: zod.ZodType)
	constructor(code: number, info: string | string[], zod?: zod.ZodType)
	constructor(
		public code: number,
		...payload: (string | string[] | zod.ZodType | undefined)[]
	){
		if(typeof payload[0] === "string" || payload[0] instanceof Array){
			this.info = typeof payload[0] === "string" ? [payload[0]] : payload[0];
			this.zod = payload[1] instanceof zod.ZodType ? payload[1] : zod.undefined();
		}
		else {
			this.zod =  payload[0] instanceof zod.ZodType ? payload[0] : zod.undefined();
		}
	}
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
