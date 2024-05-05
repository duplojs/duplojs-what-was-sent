import {AbstractRoute, Process, Route, zod, Response, DuploInstance, DuploConfig} from "@duplojs/duplojs";
import {duploExtends, duploInject} from "@duplojs/editor-tools";
import {HttpException, CustomHttpException} from "@duplojs/http-exception";
import {IHaveSentThis} from ".";

const injectedScript = (index: number) => /* js */`
/* first_line_what_was_sent_catch_[${index}] */
/* end_block */
if(injectError instanceof this.extensions["@duplojs/what-was-sent"].Response){
	const result = this.extensions["@duplojs/what-was-sent"].iHaveSentThisCollection[${index}].safeParse({
		code: injectError.status,
		body: injectError.body,
		info: injectError.information,
	});

	if(!result.success){
		injectError.isSend = false;
		injectError
		.setHeader("catched-code", injectError.status)
		.setHeader("catched-info", injectError.information)
		.code(500)
		.info("WHAT_WAS_SENT_ERROR")
		.send(result.error.toString());
	}
}

throw injectError;
`;

const injectedPreflightHttpException = () => /* js */`
if(injectError instanceof this.extensions["@duplojs/what-was-sent"].HttpException){
	try {
		if(injectError instanceof this.extensions["@duplojs/what-was-sent"].CustomHttpException){
			injectError.handler(request, response);
		}
		response.code(injectError.code).info(injectError.info).send(injectError.data);
	} catch {}

	injectError = response;
}
`;


export function injecter(instance: DuploInstance<DuploConfig>, duplose: Process | AbstractRoute | Route){
	const iHaveSentThisCollection: Array<zod.ZodType> = [];
	duploExtends(
		duplose, 
		{
			"@duplojs/what-was-sent": {
				iHaveSentThisCollection, 
				Response,
				HttpException,
				CustomHttpException,
			}
		}
	);

	duploInject(
		duplose,
		({tryCatch, code}) => {
			duplose.descs.forEach(desc => {
				if(!["cut", "checker", "handler"].includes(desc.type)) return;

				const findedIHaveSentThis: IHaveSentThis[] = desc.descStep.filter(d => d instanceof IHaveSentThis);
				if(findedIHaveSentThis.length === 0) return;

				const zodSchemas = findedIHaveSentThis.map(
					value => zod.object({
						code: zod.literal(value.code),
						body: value.bodyZodSchema,
						info: value.info 
							? zod.enum(value.info as any)
							: zod.undefined()
					})
				);
	
				iHaveSentThisCollection.push(
					zodSchemas.length === 1
						? zodSchemas[0] 
						: zod.union(zodSchemas as any)
				);
	
				const indexCollection = iHaveSentThisCollection.length - 1;

				if(desc.type === "cut" || desc.type === "checker"){
					tryCatch(
						`before_step_[${desc.index}]`,
						`after_drop_step_[${desc.index}]`,
						injectedScript(indexCollection),
						"bottom-top"
					);
				}
				else {
					tryCatch(
						"before_handler",
						"before_no_respose_sent",
						injectedScript(indexCollection),
						"bottom-top"
					);
				}

				if(instance.plugins["@duplojs/http-exception"]){
					code(
						`first_line_what_was_sent_catch_[${indexCollection}]` as any,
						injectedPreflightHttpException()
					);
				}
			});
		}
	);
}
