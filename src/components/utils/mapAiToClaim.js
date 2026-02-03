export function mapAiToClaim(ai) {
  return {
    victimData: {
      victim_fullname: ai.victim?.fullname || "",
      victim_tc: ai.victim?.tc || ""
    },

    vehicleData: {
      vehicle_plate: ai.vehicle?.plate || "",
      vehicle_chassis_no: ai.vehicle?.chassis || "",
      vehicle_brand: ai.vehicle?.brand || "",
      vehicle_model: ai.vehicle?.model || ""
    },

    insuredData: {
      insured_fullname: ai.insured?.fullname || "",
      insured_policy_no: ai.insured?.policy_no || ""
    }
  }
}
