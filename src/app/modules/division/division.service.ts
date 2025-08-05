import { IDivision } from "./division.interface";
import { Division } from "./division.model";

const createDivision = async (payload: Partial<IDivision>) => {

    const isExistDivision = await Division.findOne({ name: payload.name });

    if (isExistDivision) {
        throw new Error("A division with this name already exists.");
    }

    const division = await Division.create(payload);
    return division
}





export const DivisionServices = {
    createDivision
}