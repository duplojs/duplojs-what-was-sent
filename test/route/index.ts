import {zod} from "@duplojs/duplojs";
import {workerTesting} from "@duplojs/worker-testing";

export default workerTesting(
	__dirname + "/route.ts",
	[
		{
			title: "handler catch",
			url: "http://localhost:1506/test/1",
			method: "GET",
			response: {
				code: 500,
				info: "WHAT_WAS_SENT_ERROR",
				body: zod.string()
			}
		},
		{
			title: "cut catch",
			url: "http://localhost:1506/test/2",
			method: "GET",
			response: {
				code: 500,
				info: "WHAT_WAS_SENT_ERROR",
				body: zod.string()
			}
		},
		{
			title: "checker catch",
			url: "http://localhost:1506/test/3",
			method: "GET",
			response: {
				code: 500,
				info: "WHAT_WAS_SENT_ERROR",
				body: zod.string()
			}
		},
		{
			title: "valid schema",
			url: "http://localhost:1506/test/4",
			method: "GET",
			response: {
				code: 200,
				body: zod.literal("100")
			}
		},
	]
);
