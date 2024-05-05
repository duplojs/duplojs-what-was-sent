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
				headers: {
					"catched-code": "404",
				},
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
		{
			title: "info catch",
			url: "http://localhost:1506/test/5",
			method: "GET",
			response: {
				code: 500,
				info: "WHAT_WAS_SENT_ERROR",
				headers: {
					"catched-code": "200",
					"catched-info": "test",
				},
				body: zod.string()
			}
		},
		{
			title: "pass",
			url: "http://localhost:1506/test/6",
			method: "GET",
			response: {
				code: 200,
				info: "test",
				body: zod.literal("100")
			}
		},
	]
);
