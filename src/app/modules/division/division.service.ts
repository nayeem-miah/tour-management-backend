import { IDivision } from "./division.interface";
import { Division } from "./division.model";

const createDivision = async (payload: Partial<IDivision>) => {

    const isExistDivision = await Division.findOne({ name: payload.name });

    if (isExistDivision) {
        throw new Error("A division with this name already exists.");
    }

    const division = await Division.create(payload);
    return division
};

const getAllDivision = async () => {
    const division = await Division.find();
    const totalDivisions = await Division.countDocuments();

    return {
        data: division,
        meta: {
            total: totalDivisions
        }
    }
}

const getSingleDivision = async (slug: string) => {
    const division = await Division.findOne({ slug });

    return {
        data: division
    }
}




export const DivisionServices = {
    createDivision,
    getAllDivision,
    getSingleDivision
}