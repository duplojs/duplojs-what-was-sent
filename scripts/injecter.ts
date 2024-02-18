import {AbstractRoute, Process, Route, zod, Response} from "@duplojs/duplojs";
import {duploExtends, duploInject} from "@duplojs/editor-tools";
import {IHaveSentThis} from ".";

const injectedScript = (index: number) => /* js */ `
if(injectError instanceof this.extensions["@duplojs/what-was-sent"].Response){
	const result = this.extensions["@duplojs/what-was-sent"].iHaveSentThisCollection[${index}].safeParse({
		code: injectError.status,
		body: injectError.body
	});

	if(!result.success){
		injectError.isSend = false;
		injectError.code(500).info("WHAT_WAS_SENT_ERROR").send(result.error);
	}
}

throw injectError;
`;


export function injecter(duplose: Process | AbstractRoute | Route){
	const iHaveSentThisCollection: Array<zod.ZodType> = [];
	duploExtends(
		duplose, 
		{
			"@duplojs/what-was-sent": {
				iHaveSentThisCollection, 
				Response
			}
		}
	);

	duploInject(
		duplose,
		({tryCatch}) => {
			duplose.descs.forEach(desc => {
				const findedIHaveSentThis: IHaveSentThis[] = desc.descStep.filter(d => d instanceof IHaveSentThis);
				if(findedIHaveSentThis.length == 0) return;

				const zodSchemas = findedIHaveSentThis.map(
					value => zod.object({
						code: zod.literal(value.code),
						body: value.zodType
					})
				);

				iHaveSentThisCollection.push(
					zodSchemas.length === 1
						? zodSchemas[0] 
						: zod.union(zodSchemas as any)
				);

				const indexCollection = iHaveSentThisCollection.length - 1;
					
				if(desc.type == "cut" || desc.type == "checker"){
					tryCatch(
						`before_step_[${desc.index}]`,
						`after_drop_step_[${desc.index}]`,
						injectedScript(indexCollection),
						"bottom-top"
					);
				}
				else if(desc.type == "handler"){
					tryCatch(
						"before_handler",
						"before_no_respose_sent",
						injectedScript(indexCollection),
						"bottom-top"
					);
				}
			});
		}
	);
}
