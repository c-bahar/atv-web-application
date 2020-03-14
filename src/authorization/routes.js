/* eslint-disable default-case */
const { getCompetencyList } = require('../controllers/competency.controller');

exports.mapRouteToCompetencyId = async (path) => {
  const competencyList = await getCompetencyList();
  switch (path) {
    case 'vehicle':
      return competencyList.ARAC_GIRIS_CIKIS_ISLEMLERI;
    case 'parkinglot':
      return competencyList.OTOPARK_ISLEMLERI;
    case 'vehicletype':
      return competencyList.ARAC_TIPI_ISLEMLERI;
    case 'enforcementoffice':
      return competencyList.ICRA_KURUMU_TURLERI_ISLEMLERI;
    case 'discount':
      return competencyList.INDIRIM_ISLEMLERI;
    case 'user':
      return competencyList.PERSONEL_ISLEMLERI;
    case 'role':
      return competencyList.PROFIL_ISLEMLERI;
  }
};
