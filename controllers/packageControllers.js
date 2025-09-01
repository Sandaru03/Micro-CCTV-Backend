import Packages from "../models/package.js";

export function createPackage(req,res){
    const packages = new Packages(req.body);

    packages.save().then(
        ()=>{
            res.json({
                message : "Package Create Successfully"
            })
        }
    ).catch(
        (error)=>{
            console.error("Package Create Error:", error); // 👈 add this to debug
            res.status(500).json({
                message : "Failed to create Package",
                error: error.message
            });
        }
    )
}


export function getPackage(req,res){

   
	Packages.find()
		.then((packages) => {
			res.json(packages);
		})
		.catch(() => {
			res.json({
				message: "Failed to fetch Package",
			});
		});
}


export function updatePackageById(req, res) {
    const packageId = req.params.packageId;

    Packages.findOneAndUpdate({ packageId:packageId }, req.body, { new: true })
        .then((updatedPackage) => {
            if (!updatedPackage) {
                return res.status(404).json({ message: "Package not found" });
            }
            res.json({
                message: "Package updated successfully",
                data: updatedPackage
            });
        })
        .catch((error) => {
            res.status(500).json({ message: "Failed to update Package", error });
        });
}


// Mongodb index delete

export function dropAccessoryIndex(req, res) {
    import("../models/package.js").then(({ default: Packages }) => {
        Packages.collection.dropIndex("accessoryId_1")
            .then(() => {
                res.json({ message: "Index 'accessoryId_1' dropped successfully" });
            })
            .catch((error) => {
                res.status(500).json({ message: "Failed to drop index", error });
            });
    });
}



export function deletePackageById(req, res) {
    const PackageId = req.params.PackageId;

    Packages.findOneAndDelete({ PackageId: PackageId })
        .then((deletedPackage) => {
            if (!deletedPackage) {
                return res.status(404).json({ message: "Package not found" });
            }
            res.json({
                message: "Package deleted successfully",
                data: deletedPackage
            });
        })
        .catch((error) => {
            res.status(500).json({ message: "Failed to delete Package", error });
        });
}
