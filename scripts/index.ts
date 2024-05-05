import {AbstractRoute, DuploConfig, DuploInstance, Response, zod} from "@duplojs/duplojs";
import packageJson from "../package.json";
import {injecter} from "./injecter";

declare module "@duplojs/duplojs" {
    interface Plugins{
        "@duplojs/what-was-sent": {version: string}
    }
}

export class IHaveSentThis{
	public bodyZodSchema: zod.ZodType;
	/**@deprecated */
	public get zod(){
		return this.bodyZodSchema;
	}
	public info?: string[] = undefined;

	constructor(code: number, zod?: zod.ZodType | (() => zod.ZodType))
	constructor(code: number, info: string | string[], zod?: zod.ZodType | (() => zod.ZodType))
	constructor(
		public code: number,
		...payload: (string | string[] | zod.ZodType | (() => zod.ZodType)| undefined)[]
	){
		const info = payload.find(v => typeof v === "string" || v instanceof Array) as string | string[] | undefined;
		const zodSchema = payload.find(v => typeof v === "function" || v instanceof zod.ZodType) as zod.ZodType | (() => zod.ZodType) | undefined;

		this.info = typeof info === "string" ? [info] : info;
		this.bodyZodSchema = (typeof zodSchema === "function" ? zodSchema() : zodSchema) || zod.undefined();
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
