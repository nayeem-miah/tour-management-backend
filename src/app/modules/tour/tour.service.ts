
import { deleteImageFromCloudinary } from "../../config/cloudinary.config";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { tourSearchableFields } from "./tour.constant";
import { ITour, ITourType } from "./tour.interface";
import { Tour, TourType } from "./tour.model";


const createTour = async (payload: ITour) => {

    // throw new Error("some error then image deleted from cloudinary ")

    const existingTour = await Tour.findOne({ title: payload.title });
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

    const tour = await Tour.create(payload)

    return tour;
};



const getAllTours = async (query: Record<string, string>) => {

    const queryBuilder = new QueryBuilder(Tour.find(), query)

    const tours = await queryBuilder
        .search(tourSearchableFields)
        .filter()
        .sort()
        .fields()
        .paginate()


    // const meta = await queryBuilder.getMeta()


    const [data, meta] = await Promise.all([
        tours.build(),
        queryBuilder.getMeta()
    ])

    return {
        data: data,
        meta: meta
    }
};



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

const getSingleTour = async (slug: string) => {
    const result = await Tour.findOne({ slug })

    return {
        data: result
    }

};

const updateTour = async (id: string, payload: Partial<ITour>) => {

    const existingTour = await Tour.findById(id);

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
        payload.images = [...payload.images, ...existingTour.images]
    }

    if (payload.deleteImages && payload.deleteImages.length > 0 && existingTour.images && existingTour.images.length > 0) {
        const restDBImages = existingTour.images?.filter(imageUrl => !payload.deleteImages?.includes(imageUrl))

        const updatedPayloadImages = (payload.images || [])
            .filter(imageURl => !payload.deleteImages?.includes(imageURl))
            .filter(imageURl => !restDBImages?.includes(imageURl))

        payload.images = [...restDBImages, ...updatedPayloadImages]
    }

    const updatedTour = await Tour.findByIdAndUpdate(id, payload, { new: true });

    if (payload.deleteImages && payload.deleteImages.length > 0 && existingTour.images && existingTour.images.length > 0) {

        await Promise.all(payload.deleteImages.map(url => deleteImageFromCloudinary(url)))
    }

    return updatedTour;
};

const deleteTour = async (id: string) => {
    const tour = await Tour.findByIdAndDelete(id)
    return tour
}


//  tour types services
const createTourType = async (payload: ITourType) => {

    const existingTourType = await TourType.findOne({ name: payload.name });

    if (existingTourType) {
        throw new Error("Tour type already exists.");
    }

    return await TourType.create(payload);
};

const getAllTourTypes = async () => {
    return await TourType.find();
};

const updateTourType = async (id: string, payload: ITourType) => {
    const existingTourType = await TourType.findById(id);
    if (!existingTourType) {
        throw new Error("Tour type not found.");
    }

    const updatedTourType = await TourType.findByIdAndUpdate(id, payload, { new: true });
    return updatedTourType;
};

const deleteTourType = async (id: string) => {
    const existingTourType = await TourType.findById(id);
    if (!existingTourType) {
        throw new Error("Tour type not found.");
    }

    return await TourType.findByIdAndDelete(id);
};

const getSingleTourTypes = async (id: string) => {
    const result = await TourType.findById(id)

    return {
        data: result
    }

};



export const TourServices = {
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
}