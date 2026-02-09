export const getCities = (ilJson) => {
  const table = ilJson.find((item) => item.type === "table");
  return table?.data || [];
};

export const getDistrictsByCityId = (ilceJson, cityId) => {
  if (!cityId) return [];

  const table = ilceJson.find((item) => item.type === "table");
  if (!table?.data) return [];

  return table.data.filter(
    (district) => district.il_id === String(cityId)
  );
};
