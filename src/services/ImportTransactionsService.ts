import fs from 'fs';
import path from 'path';
import csv from 'csvtojson';
import Transaction from '../models/Transaction';
import CreateTransactionService from './CreateTransactionService';
import uploadConfig from '../config/upload';

interface Request {
  filename: string;
}
class ImportTransactionsService {
  async execute({ filename }: Request): Promise<Transaction[]> {
    const createTransactionService = new CreateTransactionService();

    const filePath = path.join(uploadConfig.directory, filename);

    const csvToJson = await csv().fromFile(filePath);

    await fs.promises.unlink(filePath);

    const transactions: Transaction[] = [];

    // eslint-disable-next-line no-restricted-syntax
    for (const item of csvToJson) {
      const { title, type, value, category } = item;

      // eslint-disable-next-line no-await-in-loop
      const transaction = await createTransactionService.execute({
        title,
        type,
        value: Number.parseFloat(value),
        category,
      });
      transactions.push(transaction);
    }
    return transactions;
  }
}

export default ImportTransactionsService;
