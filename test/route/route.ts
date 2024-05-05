import Duplo, {zod} from "@duplojs/duplojs";
import {parentPort} from "worker_threads";
import duploWhatWasSent, {IHaveSentThis} from "../../scripts";

const duplo = Duplo({port: 1506, host: "localhost", environment: "DEV"});

const checkerTest = duplo.createChecker("test")
.handler((input: boolean, output) => {
	if(input) return output("test1", undefined);
	else return output("test2", undefined);
})
.build();

duplo.use(duploWhatWasSent, {
	enabled: true
});

duplo.declareRoute("GET", "/test/1")
.handler(
	({}, res) => {
		res.code(200).send(100);
	},
	new IHaveSentThis(200, () => zod.string()),
	new IHaveSentThis(204, zod.number())
);

duplo.declareRoute("GET", "/test/2")
.cut(
	({}, res) => {
		res.send("test");

		return {};
	},
	undefined,
	new IHaveSentThis(404)
)
.handler(() => {});

duplo.declareRoute("GET", "/test/3")
.check(
	checkerTest,
	{
		input: () => true,
		result: "test2",
		catch: (res) => res.code(404).send(11)
	},
	new IHaveSentThis(400, zod.number())
)
.handler(() => {});

duplo.declareRoute("GET", "/test/4")
.handler(
	({}, res) => {
		res.code(200).send(100);
	},
	new IHaveSentThis(200, zod.string()),
	new IHaveSentThis(200, zod.number())
);

duplo.declareRoute("GET", "/test/5")
.handler(
	({}, res) => {
		res.code(200).info("test").send(100);
	},
	new IHaveSentThis(200, "toto", () => zod.number()),
);

duplo.declareRoute("GET", "/test/6")
.handler(
	({}, res) => {
		res.code(200).info("test").send(100);
	},
	new IHaveSentThis(200, "toto", () => zod.string()),
	new IHaveSentThis(200, ["test", "zozo"], zod.number()),
);

duplo.launch(() => parentPort?.postMessage("ready"));
