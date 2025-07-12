import { Request, Response } from "express";
import Transaction from "../models/transactionModel";
import { validationResult } from "express-validator";
import { paginated_result } from "../middlewares/requestPaginate";
import jwtDecode from "jwt-decode";
import User from "../models/userModel";
import { decodeToken } from "../functions/token";


// get all trasactions controller
export const get_all_transactions = async (req: Request, res: Response) => {
  const page = req.query.page ? parseInt(req.query.page as string) : 1;
  
  const per_page = req.query.per_page
    ? parseInt(req.query.per_page as string)
    : 12;
  const startIndex = (page - 1) * per_page;

  try {
    const getParams = () => {
      const { transactionType, userId } = req.query;
      
      const params: any = {};

      if (transactionType) {
        params.meta_data.transaction_type = {
          $regex: String(transactionType || ""),
        };
      }
      if (userId) {
        params.meta_data.user_id = { $regex: String(userId || "") };
      }

      return params;
    };

    const count = await Transaction.count();
    const query = await Transaction.find(getParams())
      .sort({ createdAt: -1 })
      .limit(per_page)
      .skip(startIndex);
    res.send({
      success: true,
      message: "Transactions fetched successfully",
      data: paginated_result(page, per_page, count, query),
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "An error occured",
      error,
    });
  }
};

// get loggedin user controller
export const get_logged_in_user_transactions = async (
  req: Request,
  res: Response
) => {
  const page = req.query.page ? parseInt(req.query.page as string) : 1;
  const per_page = req.query.per_page
    ? parseInt(req.query.per_page as string)
    : 12;

  try {

    const token = req.headers.authorization || req.cookies.authorization;

    const decoded_id = Object(jwtDecode(token));

    const count = await Transaction.find({ "meta_data.user_id": decoded_id.id }).count();
    const query = await Transaction.find({ "meta_data.user_id": decoded_id.id });


    res.send({
      success: true,
      message: "Transactions fetched successfully",
      data: paginated_result(page, per_page, count, query),
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: "An error occured",
      error,
    });
  }
};


// filter a user transaction by userid, transfer, bills, airtime... controller
export const get_a_user_transactions = async (req: Request, res: Response) => {

  const page = req.query.page ? parseInt(req.query.page as string) : 1;
  const per_page = req.query.per_page
    ? parseInt(req.query.per_page as string)
    : 12;

  try {

    const filter = req.params.filter_param;
    if(filter === 'Transfer' || filter === 'Bills' || filter === 'Airtime'){
      const count = await Transaction.find({source: filter}).count();
      const query = await Transaction.find({source: filter});
      res.send({
      success: true,
      message: "Transactions fetched successfully",
      data: paginated_result(page, per_page,count, query),
    });
    }else{
              
    const count = await Transaction.find({ "meta_data.user_id": filter }).count();
    const query = await Transaction.find({ "meta_data.user_id": filter });

    res.send({
      success: true,
      message: "Transactions fetched successfully",
      data: paginated_result(page, per_page, count, query),
    });
  }

  } catch (error) {
    res.status(400).json({
      success: false,
      message: "An error occured",
      error,
    });
  }
};

// get organization transaction controller
export const get_organization_transactions = async (
  req: Request,
  res: Response
) => {
  const page = req.query.page ? parseInt(req.query.page as string) : 1;
  const per_page = req.query.per_page
    ? parseInt(req.query.per_page as string) : 12;

  const adminId = decodeToken(req.cookies.authorization);

  const checkAdmin = await User.find({ _id: adminId });

  try {
    if (checkAdmin[0].userRole === 'manager' || checkAdmin[0].userRole === 'admin') {
      const count = await Transaction.find({ org_record: false }).count();
      const query = await Transaction.find({ org_record: false });

      return res.status(200).json({
        success: true,
        message: "User fetched successfully",
        data: paginated_result(page, per_page, count, query),
      });
    }

    return res.status(401).json({
      success: false,
      message: "You do not have access to this data",
    });


  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "An error occured",
      error,
    });
  }

};


export const create_transaction = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Invalid data sent.",
      error: errors.array(),
    });
  }
  try {
    const transaction = await Transaction.create(req.body);
    
    return res.status(200).json({
      success: true,
      message: "Transaction created successfully",
      data: transaction,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "An error occured while creating your transaction",
      error,
    });
  }
};
