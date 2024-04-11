import {AbstractRoute, DuploConfig, DuploInstance, Response, zod} from "@duplojs/duplojs";
import packageJson from "../package.json";
import {injecter} from "./injecter";

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

export interface WhatWasSentParameters {
	enabled?: boolean;
	globals?: boolean;
}

export default function duploWhatWasSent(
	instance: DuploInstance<DuploConfig>,
	{
		enabled = false,
		globals = false,
	}: WhatWasSentParameters = {}
){
	instance.plugins["@duplojs/what-was-sent"] = {version: packageJson.version};

	if(globals){
		//@ts-ignore
		global.IHaveSentThis = IHaveSentThis;
	}

	if(!enabled) return;

	instance.addHook("beforeBuildRouter", () => {
		instance.processes.forEach(process => injecter(instance, process));
		instance.abstractRoutes.forEach(ar => {
			if(ar instanceof AbstractRoute){
				injecter(instance, ar);
			}
		});
		Object.values(instance.routes).flat().forEach(route => injecter(instance, route));
	});
}
