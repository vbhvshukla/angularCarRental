import { Package } from "../models/packages.model.js";

/**
 * Create a package
 * @description Create a new package
 * @async
 * @param {*} req 
 * @param {*} res 
 * @returns {*} 
 */
export const createPackage = async (req, res) => {
    try {

        let {packageData,images} = req.body;
        const imageUrls = req.files;
        packageData = JSON.parse(packageData);
        console.log(packageData);
        

        const newPackage = new Package({
            name: packageData.name,
            packagePrice: packageData.packagePrice,
            images: imageUrls,
            from: packageData.from,
            to: packageData.to,
            description: packageData.description,
            routes: packageData.routes,
            cars: packageData.cars,
            driverIncluded: packageData.driverIncluded || false,
            isActive: packageData.isActive || true,
            owner: {
                _id: packageData.owner._id,
                username: packageData.owner.username,
                email: packageData.owner.email
            }
        })

        const savedPackage = await newPackage.save();

        res.status(201).json({
            msg: 'Package Created Successfully!',
            package: savedPackage
        })

    } catch (error) {
        console.error("Package Controller :: Error Creating Package", error);
        res.status(500).json({ msg: "Server Error", details: error.message });
    }
}


/**
 * Get All Packages
 * @description Getting all packages
 * @async
 * @param {*} req 
 * @param {*} res 
 * @returns {*} 
 */
export const getAllPackages = async (req, res) => {
    try {
        const { page = 1, limit = 10, from, to } = req.query;
        const pageNumber = parseInt(page, 10) || 1;
        const limitNumber = parseInt(limit, 10) || 10;

        const query = {
            isActive: true
        };

        if (from) query.from = from;
        if (to) query.to = to;

        const skip = (pageNumber - 1) * limitNumber;
        const allPackages = await Package.aggregate([
            {
                $match: query
            },
            {
                $facet: {
                    packages: [
                        { $skip: skip },
                        { $limit: limitNumber }
                    ],
                    total: [
                        { $count: "count" }
                    ]
                }
            }
        ]);

        const packages = allPackages[0]?.packages || [];
        const total = allPackages[0]?.total[0]?.count || 0;

        res.status(200).json({
            packages,
            total,
            currentPage: pageNumber,
            totalPages: Math.ceil(total / limitNumber)
        });
    } catch (error) {
        console.error("Package Controller :: Error fetching all packages", error);
        res.status(500).json({ msg: "Server Error", details: error.message });
    }
};


/**
 * Update A Package
 * @description Updating a Package
 * @async
 * @param {*} req 
 * @param {*} res 
 * @returns {unknown} 
 */
export const updatePackage = async (req, res) => {
    try {
        const { packageId } = req.params;
        const packageData = JSON.parse(req.body.packageData);
        const imageUrls = req.files.map(file => file.location);

        const updatedPackage = await Package.findByIdAndUpdate(
            packageId,
            { ...packageData },
            { ...(imageUrls.length > 0 && { images: imageUrls }) },
            { new: true }
        )

        if (!updatedPackage) {
            return res.status(404).json({
                msg: "Package not found"
            })
        }
        res.status(200).json(
            {
                msg: "Package updated successfully",
                package: updatePackage
            }
        )
    } catch (error) {
        console.error("Package Controller :: Error Updating Package", error);
        res.status(500).json({ msg: "Server Error", details: error.message })
    }
}



/**
 * Mark Package Inactive
 * @description Marks the package inactive
 * @async
 * @param {*} req 
 * @param {*} res 
 * @returns {unknown} 
 */
export const markPackageInactive = async (req, res) => {
    try {
        const { packageId } = req.params;
        const markedPackage = await Package.findByIdAndUpdate(packageId, {
            isActive: false
        })

        if (!markedPackage) {
            return res.status(404).json({ msg: "Package not found" });
        }
        res.status(200).json({ msg: "Package Updated Successfully!" });


    } catch (error) {
        console.error("Package Controller :: Error Marking Package");
        res.status(500).json({ msg: "Server error", details: error.message });
    }
}

/**
 * Get Package By ID
 * @description Fetch a package by its ID
 * @async
 * @param {*} req
 * @param {*} res
 * @returns {*}
 */
export const getPackageById = async (req, res) => {
    try {
        const { packageId } = req.params;

        const packageData = await Package.findById(packageId);
        if (!packageData) {
            return res.status(404).json({ msg: "Package not found" });
        }

        res.status(200).json({ package: packageData });
    } catch (error) {
        console.error("Package Controller :: Error fetching package by ID", error);
        res.status(500).json({ msg: "Server Error", details: error.message });
    }
};