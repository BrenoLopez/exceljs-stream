import Excel from "exceljs";
import {
  PassThrough,
  pipeline,
  Readable,
  Transform,
  Writable,
} from "node:stream";
import {
  createReadStream,
  createWriteStream,
  existsSync,
  mkdir,
  unlink,
} from "node:fs";
import writer from "csv-write-stream";
import express from "express";
import { fileURLToPath } from "url";
import { dirname, join } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const app = express();

class Xlsx extends Transform {
  workbook;
  worksheet;
  writable;

  constructor(columns, stream) {
    super({
      writableObjectMode: true,
      readableObjectMode: false,
    });
    const writable = new Writable({ objectMode: false });
    const that = this;
    writable._write = function (chunk, _, next) {
      that.push(chunk);
      next();
    };
    this.workbook = new Excel.stream.xlsx.WorkbookWriter({
      stream: writable,
    });
    this.worksheet = this.workbook.addWorksheet("pagarme");
    this.worksheet.columns = columns;
  }
  async _transform(chunk, _, callback) {
    this.worksheet.addRow(chunk).commit();
    callback();
  }
  _flush() {
    this.workbook.commit();
  }
}

function generateXlsx(stream, columns) {
  const workbook = new Excel.stream.xlsx.WorkbookWriter({ stream });
  const worksheet = workbook.addWorksheet("pagarme");
  worksheet.columns = columns;
  return new Transform({
    writableObjectMode: true,
    readableObjectMode: true,
    objectMode: true,
    transform(chunk, _, callback) {
      worksheet.addRow(chunk).commit();
      callback();
    },
    flush() {
      workbook.commit();
    },
  });
}

app.get("/", (req, res) => {
  async function* elasticSearchMock() {
    let count = 0;

    const limitOfBreak = 1e4;
    while (true) {
      if (count === limitOfBreak) {
        break;
      }
      const arrayLength = 1e3;
      count += arrayLength;
      await new Promise((resolve, reject) =>
        setTimeout(() => {
          resolve();
        }, 10)
      );
      const search = Array(arrayLength).fill({
        date: "13/01/2023 00:00",
        operationType: "Transação",
        operationId: 166457,
        operationDescription: "-",
        transactionId: "-",
        installment: "-",
        paymentMethod: "-",
        grossInflow: "1,00",
        grossOutflow: "0,00",
        operationFee: "-0,20",
        anticipationFee: "0,00",
        totalOperationFee: "-0,20",
        netInflow: "0,80",
        netOutflow: "0,00",
      });
      for await (const item of search) {
        yield item;
      }
    }
  }
  const columns = [
    { header: "Data da operação", key: "date", width: 30 },
    { header: "Tipo da operação", key: "operationType", width: 30 },
    { header: "Id da operação", key: "operationId", width: 30 },
    { header: "Descrição da operação", key: "operationDescription", width: 30 },
    { header: "Id da transação", key: "transactionId", width: 30 },
    { header: "Parcela", key: "installment", width: 30 },
    { header: "Método de pagamento", key: "paymentMethod", width: 30 },
    { header: "Entrada bruta", key: "grossInflow", width: 30 },
    { header: "Saída bruta", key: "grossOutflow", width: 30 },
    { header: "Taxa de operação", key: "operationFee", width: 30 },
    { header: "Taxa de antecipação", key: "anticipationFee", width: 30 },
    { header: "Taxa total da operação", key: "totalOperationFee", width: 30 },
    { header: "Entrada líquida", key: "netInflow", width: 30 },
    { header: "Saída líquida", key: "netOutflow", width: 30 },
  ];
  const fileName = `${Date.now()}.xlsx`;
  res.writeHead(200, {
    "Content-disposition": `attachment;filename=${fileName}`,
    "Content-Type":
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const documentStream = Readable.from(elasticSearchMock(), {
    objectMode: true,
  });
  pipeline(
    // elasticSearchMock(),
    documentStream,
    generateXlsx(columns, res),
    (error) => {
      if (error) console.log(error);
    }
  );
});

// async function *elasticSearchMock () {
//   let count = 0

//   const limitOfBreak = 2e6
//   while (true) {
//     if (count === limitOfBreak) {
//       break
//     }
//     const arrayLength = 1e3
//     count += arrayLength
//     // eslint-disable-next-line no-await-in-loop
//     await new Promise(resolve =>
//       setTimeout(() => {
//         resolve()
//       }, 10))
//     const search = Array(arrayLength).fill({
//       object: 'balance_operation',
//       id: 1,
//       status: 'waiting_funds',
//       balance_amount: 0,
//       balance_old_amount: NaN,
//       type: 'payable',
//       amount: 100,
//       fee: 20,
//       date_created: '2023-01-23T03:00:00.000Z',
//       movement_object: {
//         object: 'payable',
//         id: 2000000001,
//         status: 'waiting_funds',
//         amount: 100,
//         fee: 20,
//         anticipation_fee: 0,
//         fraud_coverage_fee: 0,
//         installment: null,
//         transaction_id: null,
//         split_rule_id: null,
//         bulk_anticipation_id: null,
//         anticipation_id: null,
//         recipient_id: 're_clddfcecs00030rtmknduux2v',
//         originator_model: null,
//         originator_model_id: null,
//         payment_date: null,
//         original_payment_date: null,
//         type: null,
//         payment_method: null,
//         accrual_date: null,
//         date_created: '2023-01-23T03:00:00.000Z',
//         liquidation_arrangement_id: null,
//       },
//     })
//     // eslint-disable-next-line no-restricted-syntax, no-await-in-loop
//     for await (const item of search) {
//       yield item
//     }
//   }
// }
app.get("/csv", async (req, res) => {
  async function* elasticSearchMock() {
    let count = 0;

    const limitOfBreak = 2e6;
    while (true) {
      if (count === limitOfBreak) {
        break;
      }
      const arrayLength = 1e3;
      count += arrayLength;
      await new Promise((resolve, reject) =>
        setTimeout(() => {
          resolve();
        }, 10)
      );
      const search = Array(arrayLength).fill({
        date: "13/01/2023 00:00",
        operationType: "Transação",
        operationId: 166457,
        operationDescription: "-",
        transactionId: "-",
        installment: "-",
        paymentMethod: "-",
        grossInflow: "1,00",
        grossOutflow: "0,00",
        operationFee: "-0,20",
        anticipationFee: "0,00",
        totalOperationFee: "-0,20",
        netInflow: "0,80",
        netOutflow: "0,00",
      });
      for await (const item of search) {
        yield item;
      }
    }
  }

  res.writeHead(200, {
    "Content-disposition": `attachment;filename=${Date.now()}.csv`,
    "Content-Type": "text/csv",
  });
  const x = Readable.from(elasticSearchMock());
  pipeline(x, writer(), res, (err) => {
    // if (err) console.log(err);
  });
});

app.get("/csv2", (req, res) => {
  const readStream = Readable.from(Array(2e6).fill({ a: 1, b: 2, c: 3 }), {
    objectMode: true,
  });
  // console.log(process.memoryUsage().heapUsed / 1024 ** 2 + " MB");

  const fileName = `${Date.now()}.csv`;
  res.writeHead(200, {
    "Content-disposition": `attachment;filename=${fileName}`,
    "Content-Type": "text/csv",
  });
  const folderName = "temp";
  const pathFile = join(__dirname, folderName, fileName);

  if (!existsSync(folderName)) {
    mkdir("./temp", (err) => {
      if (err) console.log(err);
      // console.log("path was created");
    });
  }
  const createFile = createWriteStream(pathFile);

  pipeline(readStream, writer(), createFile, (err) => {
    // if (err) console.log(err);
  });
  createFile.on("finish", () => {
    const readFile = createReadStream(pathFile);
    pipeline(readFile, res, (err) => {
      if (err) {
        // console.log(err);
      }
    });
  });
  res.on("close", () => {
    unlink(pathFile, (err) => {
      if (err) console.log(err);
      // console.log("csv was deleted");
    });
    // console.log(process.memoryUsage().heapUsed / 1024 ** 2 + " MB");
  });
});
app.listen(3000, () => console.log("server is running at 3000 port"));
