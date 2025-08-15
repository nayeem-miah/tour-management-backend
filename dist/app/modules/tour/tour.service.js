"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TourServices = void 0;
const cloudinary_config_1 = require("../../config/cloudinary.config");
const QueryBuilder_1 = require("../../utils/QueryBuilder");
const tour_constant_1 = require("./tour.constant");
const tour_model_1 = require("./tour.model");
const createTour = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    // throw new Error("some error then image deleted from cloudinary ")
    const existingTour = yield tour_model_1.Tour.findOne({ title: payload.title });
    if (existingTour) {
        throw new Error("A tour with this title already exists.");
    }
    // const baseSlug = payload.title.toLowerCase().split(" ").join("-")
    // let slug = `${baseSlug}`
    // let counter = 0;
    // while (await Tour.exists({ slug })) {
    //     slug = `${slug}-${counter++}` // dhaka-division-2
    // }
    // payload.slug = slug;
    const tour = yield tour_model_1.Tour.create(payload);
    return tour;
});
const getAllTours = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const queryBuilder = new QueryBuilder_1.QueryBuilder(tour_model_1.Tour.find(), query);
    const tours = yield queryBuilder
        .search(tour_constant_1.tourSearchableFields)
        .filter()
        .sort()
        .fields()
        .paginate();
    // const meta = await queryBuilder.getMeta()
    const [data, meta] = yield Promise.all([
        tours.build(),
        queryBuilder.getMeta()
    ]);
    return {
        data: data,
        meta: meta
    };
});
// const getAllTours = async (query: Record<string, string>) => {
//     const filter = query
//     const searchTerm = query.searchTerm || "";
//     const sort = query.sort || "-createdAt";
//     // field filtering
//     const fields = query.fields?.split(",").join(" ") || "";
//     // old  ----> title,location
//     // new -----> title location
//     //------- pagination ----
//     //  pagination --> ?page=30&limit=10
//     // skip = (page -1) * limit
//     const page = Number(query.page) || 1
//     const limit = Number(query.limit) || 10
//     const skip = (page - 1) * limit
//     // delete filter["searchTerm"];
//     // delete filter["sort"];
//     for (const field of excludeField) {
//         // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
//         delete filter[field];
//     }
//     const searchQuery = { $or: tourSearchableFields.map(field => ({ [field]: { $regex: searchTerm, $options: "i" } })) }
//     // const data = await Tour.find(
//     //     {
//     //     // title: { $regex: searchTerm, $options: "i" }
//     //     $or: [
//     //         { title: { $regex: searchTerm, $options: "i" } },
//     //         { description: { $regex: searchTerm, $options: "i" } },
//     //         { location: { $regex: searchTerm, $options: "i" } }
//     //     ]
//     // })
//     // const tours = await Tour.find(searchQuery).find(filter).sort(sort).select(fields).skip(skip).limit(limit);
//     const filterQuery = Tour.find(filter)
//     const tours = filterQuery.find(searchQuery)
//     const allTours = await tours.sort(sort).select(fields).skip(skip).limit(limit);
//     //  document count
//     const totalTours = await Tour.countDocuments();
//     const totalPage = Math.ceil(totalTours / limit);
//     const meta = {
//         page: page,
//         limit: limit,
//         total: totalTours,
//         totalPage: totalPage
//     }
//     return {
//         data: allTours,
//         meta: meta
//     }
// };
const getSingleTour = (slug) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield tour_model_1.Tour.findOne({ slug });
    return {
        data: result
    };
});
const updateTour = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const existingTour = yield tour_model_1.Tour.findById(id);
    if (!existingTour) {
        throw new Error("Tour not found.");
    }
    // if (payload.title) {
    //     const baseSlug = payload.title.toLowerCase().split(" ").join("-")
    //     let slug = `${baseSlug}`
    //     let counter = 0;
    //     while (await Tour.exists({ slug })) {
    //         slug = `${slug}-${counter++}`
    //     }
    //     payload.slug = slug
    // }
    if (payload.images && payload.images.length > 0 && existingTour.images && existingTour.images.length > 0) {
        payload.images = [...payload.images, ...existingTour.images];
    }
    if (payload.deleteImages && payload.deleteImages.length > 0 && existingTour.images && existingTour.images.length > 0) {
        const restDBImages = (_a = existingTour.images) === null || _a === void 0 ? void 0 : _a.filter(imageUrl => { var _a; return !((_a = payload.deleteImages) === null || _a === void 0 ? void 0 : _a.includes(imageUrl)); });
        const updatedPayloadImages = (payload.images || [])
            .filter(imageURl => { var _a; return !((_a = payload.deleteImages) === null || _a === void 0 ? void 0 : _a.includes(imageURl)); })
            .filter(imageURl => !(restDBImages === null || restDBImages === void 0 ? void 0 : restDBImages.includes(imageURl)));
        payload.images = [...restDBImages, ...updatedPayloadImages];
    }
    const updatedTour = yield tour_model_1.Tour.findByIdAndUpdate(id, payload, { new: true });
    if (payload.deleteImages && payload.deleteImages.length > 0 && existingTour.images && existingTour.images.length > 0) {
        yield Promise.all(payload.deleteImages.map(url => (0, cloudinary_config_1.deleteImageFromCloudinary)(url)));
    }
    return updatedTour;
});
const deleteTour = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const tour = yield tour_model_1.Tour.findByIdAndDelete(id);
    return tour;
});
//  tour types services
const createTourType = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const existingTourType = yield tour_model_1.TourType.findOne({ name: payload.name });
    if (existingTourType) {
        throw new Error("Tour type already exists.");
    }
    return yield tour_model_1.TourType.create(payload);
});
const getAllTourTypes = () => __awaiter(void 0, void 0, void 0, function* () {
    return yield tour_model_1.TourType.find();
});
const updateTourType = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const existingTourType = yield tour_model_1.TourType.findById(id);
    if (!existingTourType) {
        throw new Error("Tour type not found.");
    }
    const updatedTourType = yield tour_model_1.TourType.findByIdAndUpdate(id, payload, { new: true });
    return updatedTourType;
});
const deleteTourType = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const existingTourType = yield tour_model_1.TourType.findById(id);
    if (!existingTourType) {
        throw new Error("Tour type not found.");
    }
    return yield tour_model_1.TourType.findByIdAndDelete(id);
});
const getSingleTourTypes = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield tour_model_1.TourType.findById(id);
    return {
        data: result
    };
});
exports.TourServices = {
    createTour,
    getAllTours,
    updateTour,
    deleteTour,
    getSingleTour,
    createTourType,
    getAllTourTypes,
    updateTourType,
    deleteTourType,
    getSingleTourTypes
};
