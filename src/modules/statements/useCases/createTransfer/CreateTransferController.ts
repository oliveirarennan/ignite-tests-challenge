import { Request, Response } from "express";
import { container } from "tsyringe";
import { CreateTransferUseCase } from "./CreateTransferUseCase";

class CreateTransferController {
  async execute(request: Request, response: Response): Promise<Response> {
    const receiver_id = request.params.user_id;
    const { id: sender_id } = request.user;
    const { amount, description } = request.body;

    const createTransferUseCase = container.resolve(CreateTransferUseCase);

    await createTransferUseCase.execute({
      receiver_id,
      sender_id,
      amount,
      description,
    });

    return response.status(201).send();
  }
}

export { CreateTransferController };
