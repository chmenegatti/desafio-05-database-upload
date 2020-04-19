import { getRepository, getCustomRepository } from 'typeorm';

import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';
import Category from '../models/Category';
import TransactionRepository from '../repositories/TransactionsRepository';

interface Request {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    type,
    value,
    category,
  }: Request): Promise<Transaction> {
    const categoryRepository = getRepository(Category);
    const transactionRepository = getCustomRepository(TransactionRepository);

    const { total } = await transactionRepository.getBalance();

    if (type === 'outcome' && value > total) {
      throw new AppError('Not Enough Funds', 400);
    }

    let checkCategoryExists = await categoryRepository.findOne({
      where: { title: category },
    });

    if (!checkCategoryExists) {
      checkCategoryExists = categoryRepository.create({ title: category });

      await categoryRepository.save(checkCategoryExists);
    }

    const transaction = transactionRepository.create({
      title,
      value,
      type,
      category_id: checkCategoryExists.id,
    });
    await transactionRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
