import Repair from "../models/repair.js";

export function createReapair(req,res){

    const repair = new Repair(req.body);

    repair.save().then(
        ()=>{
            res.json({
                message : "Repair Create Successfully"
            })
        }
    ).catch(
        ()=>{
            res.json({
                message : "Failed to create repair"
            })
        }
    )
}

export function getRepair(req,res){

    Repair.find()
		.then((repair) => {
			res.json(repair);
		})
		.catch(() => {
			res.json({
				message: "Failed to fetch Repair",
			});
		});
}


export async function updateRepairById(req, res) {
  try {
    const id = req.params.id;
    const update = {
      deviceName: req.body.deviceName,
      serialNo: req.body.serialNo,
      progress: req.body.progress,
      notes: req.body.notes,
      estimatedDate: req.body.estimatedDate,
    };

    const updated = await Repair.findByIdAndUpdate(id, update, { new: true });
    if (!updated) {
      return res.status(404).json({ message: "Repair not found" });
    }
    return res.json({ message: "Repair Updated Successfully", repair: updated });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to update repair" });
  }
}