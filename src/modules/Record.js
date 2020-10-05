/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */


/* eslint-disable */
import settings from 'global.config.js';
import {
  JsonUtils
} from 'JsonUtils.js';

export class Record {

  constructor(data, useFashionRepo=false) {
    this.validImg = this.findValidImg(data.media);
    this.myfullimg = this.getGlobal('/img/assets/img/loader.gif');
    this.imgworks = false;
    this.source_uri = '';
    this.externalId = -1;
    this.dataProvider = '';
    this.provider = '';
    this.source = '';
    this.likes = '';
    this.rights = '';
    this.mediatype = '';
    this.mediaType = null;
    this.creator = '';
    this.vtype = 'IMAGE';
    this.useFashionRepo = useFashionRepo || window.location.href.includes("garment-type");
    //this.mediatype='IMAGE';
		this.replaceImages = {
			"56ec712875fe241fb97de07c" : "https://api.europeana.eu/api/v2/thumbnail-by-url.json?size=w400&type=IMAGE&uri=http%3A%2F%2Fwww.topfoto.co.uk%2Fimageflows%2Fimagethumb%2Ff%3DEUFD001764",
			"56efc018713f210b9b88b788" : "https://api.europeana.eu/api/v2/thumbnail-by-url.json?size=w400&type=IMAGE&uri=http%3A%2F%2Feuropeana.parisiennedephotographie.fr%2FSSEU%2FFiles%2F2fe40969af14704542d5c5ec9604b53667e227ac378019d0349b7937ca7bf4dd",
			"56ec6e0d75fe241fb97dd45e" : "https://api.europeana.eu/api/v2/thumbnail-by-url.json?size=w400&type=IMAGE&uri=http%3A%2F%2Fwww.topfoto.co.uk%2Fimageflows%2Fimagethumb%2Ff%3DEUFD103357",
			"56ec6f0075fe241fb97dd823" : "https://api.europeana.eu/api/v2/thumbnail-by-url.json?size=w400&type=IMAGE&uri=http%3A%2F%2Fwww.topfoto.co.uk%2Fimageflows%2Fimagethumb%2Ff%3DEUFD102390",
			"56ec712875fe241fb97de07c" : "https://api.europeana.eu/api/v2/thumbnail-by-url.json?size=w400&type=IMAGE&uri=http%3A%2F%2Fwww.topfoto.co.uk%2Fimageflows%2Fimagethumb%2Ff%3DEUFD001764",
			"56ec351e75fe241fb97d6cca" : "https://api.europeana.eu/api/v2/thumbnail-by-url.json?size=w400&type=IMAGE&uri=http%3A%2F%2Frepositorio.iaph.es%2Fbitstream%2F11532%2F161402%2F1%2F70_0083457.jpg",
			"574e9d5f4c74792548e6353e" : "https://api.europeana.eu/api/v2/thumbnail-by-url.json?size=w400&type=IMAGE&uri=http%3A%2F%2Fwakefieldmuseumcollections.org.uk%2Fimages%2FD0007640.jpg",
			"56ee3488713f2101ec4481b3" : "https://api.europeana.eu/api/v2/thumbnail-by-url.json?size=w400&type=IMAGE&uri=https%3A%2F%2Fapsida.cut.ac.cy%2Ffiles%2Foriginal%2Fbe3d59549c59a674a12ebeabda17f1b5.tif",
			"56ef1cb975fe242ea7427afa" : "https://api.europeana.eu/api/v2/thumbnail-by-url.json?size=w400&type=IMAGE&uri=http%3A%2F%2Fwww.topfoto.co.uk%2Fimageflows%2Fimagepreview%2Ff%3DEU061811",
			"574e9c4b4c74792548e63538" : "https://api.europeana.eu/api/v2/thumbnail-by-url.json?size=w400&type=IMAGE&uri=http%3A%2F%2Fwakefieldmuseumcollections.org.uk%2Fimages%2FD0007630.jpg",
			"5d9c7f4f4c74792a90652397" : "https://proxy.europeana.eu/2022502/_KAMRA_86748?api_url=https%3A%2F%2Fapi.europeana.eu%2Fapi&view=https%3A%2F%2Fwww.kamra.si%2Fimages%2Fmmelementi%2Fslike%2Foriginals%2F10784_2005_001.jpg",
			"5bc540004c74790348bcc30b" : "https://api.europeana.eu/api/v2/thumbnail-by-url.json?size=w400&type=IMAGE&uri=http%3A%2F%2Fwww.vino-online.net%2Fanschaubilder%2FDigital9%2F19815049.jpg",
			"5c64415c4c7479321126394f" : "https://api.europeana.eu/api/v2/thumbnail-by-url.json?size=w400&type=IMAGE&uri=http%3A%2F%2Fwww.szepmuveszeti.hu%2Fdata%2Fmutargykepek%2F1%2F3604%2F13604.jpg",
			"5c6445224c74793211264387" : "https://api.europeana.eu/api/v2/thumbnail-by-url.json?size=w400&type=IMAGE&uri=http%3A%2F%2Fadore.ugent.be%2FOpenURL%2Fresolve%3Fsvc_id%3Dmedium%26url_ver%3DZ39.88-2004%26rft_id%3Darchive.ugent.be%3AFCEFC7FE-9F6C-11DF-91B0-DA4AC2C209CF%3A1",
			"5c64469a4c74793211264836" : "https://api.europeana.eu/api/v2/thumbnail-by-url.json?size=w400&type=IMAGE&uri=http%3A%2F%2Fadore.ugent.be%2FOpenURL%2Fresolve%3Fsvc_id%3Dmedium%26url_ver%3DZ39.88-2004%26rft_id%3Darchive.ugent.be%3A6E33A102-9F99-11DF-A020-3451C2C209CF%3A1",
			"5ced2e2b4c74797c594a462f" : "https://api.europeana.eu/api/v2/thumbnail-by-url.json?size=w400&type=IMAGE&uri=http%3A%2F%2Fwww.dw.de%2Fimage%2F0%2C%2C17146448_11%2C00.jpg",
			"5ced15984c74797c594a3ace" : "https://api.europeana.eu/api/v2/thumbnail-by-url.json?size=w400&type=IMAGE&uri=http%3A%2F%2Fwww.dw.de%2Fimage%2F0%2C%2C1002654_11%2C00.jpg",
			"5ced1f494c74797c594a4226" : "https://api.europeana.eu/api/v2/thumbnail-by-url.json?size=w400&type=IMAGE&uri=http%3A%2F%2Fwww.ltmcollection.org%2Fimages%2Fwebmax%2Fun%2Fi00001un.jpg",
			"5ced20be4c74797c594a42a5" : "https://api.europeana.eu/api/v2/thumbnail-by-url.json?size=w400&type=IMAGE&uri=http%3A%2F%2Fhdl.handle.net%2F10107%2F1502837-13",
			"5ced34174c74797c594a503c" : "https://api.europeana.eu/api/v2/thumbnail-by-url.json?size=w400&type=IMAGE&uri=http%3A%2F%2Fwww.ltmcollection.org%2Fimages%2Fwebmax%2Fg9%2Fi0000bg9.jpg",
			"5d9c84244c74792a9065291e" : "https://api.europeana.eu/api/v2/thumbnail-by-url.json?size=w400&type=IMAGE&uri=http%3A%2F%2Fwww.dmg-lib.org%2Fdmglib%2Fhandler%3Ffile%3Dimages_001%2Fimg_130524_005137_026151023_%2F_tn_247x350_Elephant_clock.jpg.jpg",
			"5d9c86154c74792a90652c0a" : "https://api.europeana.eu/api/v2/thumbnail-by-url.json?size=w400&type=IMAGE&uri=https%3A%2F%2Fapsida.cut.ac.cy%2Ffiles%2Foriginal%2Fd2c2323f33de8318ae286921619518eb.tif",
			"5db2ccf94c74792fee7f10a1" : "https://api.europeana.eu/api/v2/thumbnail-by-url.json?size=w400&type=IMAGE&uri=http%3A%2F%2Fwww.topfoto.co.uk%2Fimageflows%2Fimagepreview%2Ff%3DEU057141",
			"5ced1f494c74797c594a4226" : "https://api.europeana.eu/api/v2/thumbnail-by-url.json?size=w400&type=IMAGE&uri=http%3A%2F%2Fwww.ltmcollection.org%2Fimages%2Fwebmax%2Fun%2Fi00001un.jpg",
			"5ced1ff74c74797c594a4246" : "https://api.europeana.eu/api/v2/thumbnail-by-url.json?size=w400&type=IMAGE&uri=http%3A%2F%2Fwww.ltmcollection.org%2Fimages%2Fwebmax%2F39%2F0945-39.jpg",
			"5db838ec4c74792fee7f8af1" : "https://api.europeana.eu/api/v2/thumbnail-by-url.json?size=w400&type=IMAGE&uri=http%3A%2F%2Fwww.topfoto.co.uk%2Fimageflows%2Fimagepreview%2Ff%3DEU037546",
			"5db836fb4c74792fee7f86db" : "https://api.europeana.eu/api/v2/thumbnail-by-url.json?size=w400&type=IMAGE&uri=http%3A%2F%2Fwww.ltmcollection.org%2Fimages%2Fwebmax%2Frj%2Fi00001rj.jpg",
			"5db84acd4c74792fee7fcae5" : "http://openbeelden.nl/images/603101/IJsbrekers_vanuit_Amsterdam_over_het_dichtgevroren_meer_%282_00%29.png",
			"5db85fd94c74792fee7fff10" : "https://api.europeana.eu/api/v2/thumbnail-by-url.json?size=w400&type=IMAGE&uri=http%3A%2F%2Fhdl.handle.net%2F10107%2F1473566-13",
			"5d9c87044c74792a90652c39" : "https://api.europeana.eu/api/v2/thumbnail-by-url.json?size=w400&type=IMAGE&uri=http%3A%2F%2Fwww.dmg-lib.org%2Fdmglib%2Fhandler%3Ffile%3Dimages_001%2Fimg_130224_230949_032206023_%2F_tn_350x224_FORLANINI_Enrico_Milano-1848_MIlano-1930__hydrofoil.jpg.jpg",
			"5d9dcdb74c74792a90655908" : "https://api.europeana.eu/api/v2/thumbnail-by-url.json?size=w400&type=IMAGE&uri=http%3A%2F%2Fwww.topfoto.co.uk%2Fimageflows%2Fimagepreview%2Ff%3DEU022290",
			"5d9df2104c74792a9065bcb8" : "https://api.europeana.eu/api/v2/thumbnail-by-url.json?size=w400&type=IMAGE&uri=http%3A%2F%2Fwww.topfoto.co.uk%2Fimageflows%2Fimagepreview%2Ff%3DEU048022",
			"5d9e24264c74792a90660dce" : "https://api.europeana.eu/api/v2/thumbnail-by-url.json?size=w400&type=IMAGE&uri=http%3A%2F%2Fwww.nationalgallery.gr%2Fassets%2Fartworks%2Feu_i_thumbnails%2F81993_500_250.jpg",
			"5d9ee9064c74792a90665b7d" : "https://api.europeana.eu/api/v2/thumbnail-by-url.json?size=w400&type=IMAGE&uri=http%3A%2F%2Ffototeka.heritagemalta.org%2Fimg%2F2147%2F11693.tif.thumb.jpg",
			"5d9f00c14c74792a9066627d" : "https://api.europeana.eu/api/v2/thumbnail-by-url.json?size=w400&type=IMAGE&uri=http%3A%2F%2Fwww.regione.piemonte.it%2Fcultura%2Fcms%2Fbatch%2Foai2%2Fimg.php%3Fimg%3DGPC%2FF%2F1408%2F01R02305690013.003_1.jpg%26th%3Dtrue",
			"5d9f04fa4c74792a90667276" : "http://rs.kystreise.no/filestore/4/5/3/0_759fbcacead6a55/4530scr_f1549ed7a61fd1d.jpg",
			"5d9f2fb34c74792a9066b07a" : "https://api.europeana.eu/api/v2/thumbnail-by-url.json?size=w400&type=IMAGE&uri=http%3A%2F%2Fwww.topfoto.co.uk%2Fimageflows%2Fimagepreview%2Ff%3DEU028255",
			"5da45a424c74792a90672bf7" : "https://api.europeana.eu/api/v2/thumbnail-by-url.json?size=w400&type=IMAGE&uri=https%3A%2F%2Frsai.locloudhosting.net%2Ffiles%2Foriginal%2F9c02e89f58669337d4336599ca6693dd.jpg",
			"5da476a24c74792a9067862c" : "https://api.europeana.eu/api/v2/thumbnail-by-url.json?size=w400&type=IMAGE&uri=http%3A%2F%2Fwww.regione.piemonte.it%2Fcultura%2Fcms%2Fbatch%2Foai2%2Fimg.php%3Fimg%3DGPC%2FF%2F352%2F01R01904100002.121_1.jpg%26th%3Dtrue",
			"5db827df4c74792fee7f837e" : "https://api.europeana.eu/api/v2/thumbnail-by-url.json?size=w400&type=IMAGE&uri=http%3A%2F%2Fwww.topfoto.co.uk%2Fimageflows%2Fimagepreview%2Ff%3DEU042575",
			"5db974e04c74792fee80407d" : "https://api.europeana.eu/api/v2/thumbnail-by-url.json?size=w400&type=IMAGE&uri=http%3A%2F%2Fwww.dmg-lib.org%2Fdmglib%2Fhandler%3Ffile%3Dimages_001%2Fimg_130523_163417_037863023_%2F_tn_350x233_foto_di_moto_Aprilia.jpg.jpg",
			"5db2d5494c74792fee7f12d1" : "https://api.europeana.eu/api/v2/thumbnail-by-url.json?size=w400&type=IMAGE&uri=http%3A%2F%2Fwakefieldmuseumcollections.org.uk%2Fimages%2FD0001730.jpg",
			"5bc540004c74790348bcc30b" : "https://api.europeana.eu/api/v2/thumbnail-by-url.json?size=w400&type=IMAGE&uri=http%3A%2F%2Fwww.vino-online.net%2Fanschaubilder%2FDigital9%2F19815049.jpg",
			"5ced20be4c74797c594a42a5" : "https://api.europeana.eu/api/v2/thumbnail-by-url.json?size=w400&type=IMAGE&uri=http%3A%2F%2Fhdl.handle.net%2F10107%2F1502837-13",
			"5ced34174c74797c594a503c" : "https://api.europeana.eu/api/v2/thumbnail-by-url.json?size=w400&type=IMAGE&uri=http%3A%2F%2Fwww.ltmcollection.org%2Fimages%2Fwebmax%2Fg9%2Fi0000bg9.jpg",
			"5db844ae4c74792fee7fb2b8" : "https://api.europeana.eu/api/v2/thumbnail-by-url.json?size=w400&type=IMAGE&uri=http%3A%2F%2Fwww.dmg-lib.org%2Fdmglib%2Fhandler%3Ffile%3Dimages_001%2Fimg_130601_174221_038035023_%2F_tn_350x154_GRIMALDI-Armatori_1945_Napoli_container-ship.png.jpg",
			"5db837304c74792fee7f86e9" : "https://api.europeana.eu/api/v2/thumbnail-by-url.json?size=w400&type=IMAGE&uri=http%3A%2F%2Fwww.ltmcollection.org%2Fimages%2Fwebmax%2Ffk%2Fi0000lfk.jpg",
			"5db822784c74792fee7f79fd" : "https://api.europeana.eu/api/v2/thumbnail-by-url.json?size=w400&type=IMAGE&uri=http%3A%2F%2Fdlibrary.ascsa.edu.gr%2Fimages%2Fasksa%2Fd60d9dae998ace8377b166333472c0ff_5000_5000_600_.jpg",
			"5db2fff84c74792fee7f5c87" : "https://api.europeana.eu/api/v2/thumbnail-by-url.json?size=w400&type=IMAGE&uri=http%3A%2F%2Feuropeana.parisiennedephotographie.fr%2FSSEU%2FFiles%2F11543372610ac5a768993874563553afa16940cf1359f98b9cb6b98e783de5de",
			"5db2ff924c74792fee7f5be4" : "https://api.europeana.eu/api/v2/thumbnail-by-url.json?size=w400&type=IMAGE&uri=http%3A%2F%2Fwww.topfoto.co.uk%2Fimageflows%2Fimagepreview%2Ff%3DEU011911",
			"5db973c84c74792fee803f62" : "https://api.europeana.eu/api/v2/thumbnail-by-url.json?size=w400&type=IMAGE&uri=http%3A%2F%2Fwww.dmg-lib.org%2Fdmglib%2Fhandler%3Ffile%3Dimages_001%2Fimg_120313_163020_Camion_Militar_Eduardo_Barreiros%2F_tn_350x242_img_120313_163020_Camion_Militar_Eduardo_Barreiros.tif.jpg",
			"5dad95674c74793bb0b6bb6b" : "https://api.europeana.eu/api/v2/thumbnail-by-url.json?size=w400&type=IMAGE&uri=http%3A%2F%2Fwakefieldmuseumcollections.org.uk%2Fimages%2FD0004790.jpg",
			"5dad92d44c74793bb0b6b528" : "https://api.europeana.eu/api/v2/thumbnail-by-url.json?size=w400&type=IMAGE&uri=http%3A%2F%2Fwww.polfoto.dk%2F_Layouts%2FJPPol.PolPhoto.Base%2FGetPolPhotoImageHttpHandler.ashx%3FID%3D15128006",
			"5daef3cd4c74793bb0b6fb74" : "https://api.europeana.eu/api/v2/thumbnail-by-url.json?size=w400&type=IMAGE&uri=http%3A%2F%2Fwww.umbriacultura.it%2Fsamira_fe%2Fdata%2F%2Ffondazione_ranieri_sorbello%2F10_Giochi%2F100_3851.JPG",
			"5daeed104c74793bb0b6f492" : "https://api.europeana.eu/api/v2/thumbnail-by-url.json?size=w400&type=IMAGE&uri=http%3A%2F%2Fdipdig.cultura.gencat.cat%2Fanc%2FancImatgesNT%2FN%2FANC_440073_285493.jpg",
			"5d9e140c4c74792a9065eae7" : "https://proxy.europeana.eu/2023872/museaalView_64256?api_url=https%3A%2F%2Fapi.europeana.eu%2Fapi&view=http%3A%2F%2Fwww.muis.ee%2FOAIService%2FImageServlet%3Fid%3D676544%26thumb%3Dfalse%26museaal%3Dfalse",
			"5dadb3724c74793bb0b6cb0b" : "http://openbeelden.nl/images/603969/Training_van_het_Nederlandse_waterpoloteam_voor_het_toernooi_om_de_Trofeo_d%27Italia_%280_39%29.png",
			"5da430c44c74792a9066f7df" : "https://api.europeana.eu/api/v2/thumbnail-by-url.json?size=w400&type=IMAGE&uri=http%3A%2F%2Fdipdig.cultura.gencat.cat%2Fanc%2FancImatgesNT%2FN%2FANC_439363_285523.jpg",
			"5da432d54c74792a9066fa5c" : "https://proxy.europeana.eu/2051945/data_euscreenXL_http___www_ceskatelevize_cz_ivysilani_10123419768_bojova_umeni_aneb_jednota_osobnosti_207562230700006_o_vytrvalosti_a_skepsi_?api_url=https%3A%2F%2Fapi.europeana.eu%2Fapi&view=http%3A%2F%2Fimg.ceskatelevize.cz%2Fprogram%2Fporady%2F10123419768%2Ffoto%2Funi_207562230700006.jpg",
			"5da433724c74792a9066fb8a" : "https://api.europeana.eu/api/v2/thumbnail-by-url.json?size=w400&type=IMAGE&uri=http%3A%2F%2Feuropeana.parisiennedephotographie.fr%2FSSEU%2FFiles%2F6055e6da95d99b3116c6962bfde3b02ef6fc184483143c50e31df97ace091b7f",
			"5da434fa4c74792a9066fdce" : "https://api.europeana.eu/api/v2/thumbnail-by-url.json?size=w400&type=IMAGE&uri=http%3A%2F%2Feuropeana.parisiennedephotographie.fr%2FSSEU%2FFiles%2F8841e08e6052bce22334b2bab1306087",
			"5da438724c74792a90670f85" : "https://api.europeana.eu/api/v2/thumbnail-by-url.json?size=w400&type=IMAGE&uri=https%3A%2F%2Fwww.searchculture.gr%2Faggregator%2Fthumbnails%2Fedm-record%2FHOC%2F000062-11688_100752",
			"5daee74c4c74793bb0b6ed78" : "https://api.europeana.eu/api/v2/thumbnail-by-url.json?size=w400&type=IMAGE&uri=http%3A%2F%2Feuropeana.parisiennedephotographie.fr%2FSSEU%2FFiles%2F3c171f76fafcd5d3e48414e97f4ba2f798f30123763cf704464846bd237d5c71",
			"5daed1fa4c74793bb0b6e8d1" : "https://api.europeana.eu/api/v2/thumbnail-by-url.json?size=w400&type=IMAGE&uri=http%3A%2F%2Farchitekturmuseum.ub.tu-berlin.de%2Fimages%2F640%2F39468.jpg",
			"5daeca744c74793bb0b6db1a" : "https://api.europeana.eu/api/v2/thumbnail-by-url.json?size=w400&type=IMAGE&uri=http%3A%2F%2Farchitekturmuseum.ub.tu-berlin.de%2Fimages%2F640%2F39397.jpg",
			"5daef85d4c74793bb0b6fd22" : "https://api.europeana.eu/api/v2/thumbnail-by-url.json?size=w400&type=IMAGE&uri=http%3A%2F%2Fwakefieldmuseumcollections.org.uk%2Fimages%2FD0007690.jpg",
			"5dadb42c4c74793bb0b6cb40" : "https://api.europeana.eu/api/v2/thumbnail-by-url.json?size=w400&type=IMAGE&uri=http%3A%2F%2Fdipdig.cultura.gencat.cat%2Fanc%2FancImatgesNT%2FN%2FANC_132460_134565.jpg",
			"5da595a04c74792a9067ce19" : "https://api.europeana.eu/api/v2/thumbnail-by-url.json?size=w400&type=IMAGE&uri=http%3A%2F%2Fwww.topfoto.co.uk%2Fimageflows%2Fimagepreview%2Ff%3DEU041843",
			"5da5d9064c74792a906817fc" : "https://api.europeana.eu/api/v2/thumbnail-by-url.json?size=w400&type=IMAGE&uri=http%3A%2F%2Fwww.ltmcollection.org%2Fimages%2Fwebmax%2F33%2F1356-33.jpg",
			"5da711454c74792a9068370d" : "https://api.europeana.eu/api/v2/thumbnail-by-url.json?size=w400&type=IMAGE&uri=http%3A%2F%2Fadore.ugent.be%2FOpenURL%2Fresolve%3Fsvc_id%3Dmedium%26url_ver%3DZ39.88-2004%26rft_id%3Darchive.ugent.be%3A20C638E2-9F37-11DF-91EF-1A84C2C209CF%3A1",
			"5da7117d4c74792a9068371f" : "https://api.europeana.eu/api/v2/thumbnail-by-url.json?size=w400&type=IMAGE&uri=http%3A%2F%2Fwww.topfoto.co.uk%2Fimageflows%2Fimagepreview%2Ff%3DEU003458",
			"5da71ca84c74792a90684be8" : "https://api.europeana.eu/api/v2/thumbnail-by-url.json?size=w400&type=IMAGE&uri=http%3A%2F%2Feuropeana.parisiennedephotographie.fr%2FSSEU%2FFiles%2F7e44f5d0682fac2ec6e92ef752ee012ca78c354c4a9cfc269410c340f3fa2d22",
			"5da71d8c4c74792a90684cc0" : "https://proxy.europeana.eu/2023872/museaalView_247469?api_url=https%3A%2F%2Fapi.europeana.eu%2Fapi&view=http%3A%2F%2Fwww.muis.ee%2FOAIService%2FImageServlet%3Fid%3D172332%26thumb%3Dfalse%26museaal%3Dfalse",
			"5da71def4c74792a90684d25" : "https://proxy.europeana.eu/2023872/museaalView_7859?api_url=https%3A%2F%2Fapi.europeana.eu%2Fapi&view=http%3A%2F%2Fwww.muis.ee%2FOAIService%2FImageServlet%3Fid%3D629385%26thumb%3Dfalse%26museaal%3Dfalse",
			"5da98d5b4c74792a90687e44" : "https://proxy.europeana.eu/2023872/museaalView_1311796?api_url=https%3A%2F%2Fapi.europeana.eu%2Fapi&view=http%3A%2F%2Fwww.muis.ee%2FOAIService%2FImageServlet%3Fid%3D218296%26thumb%3Dfalse%26museaal%3Dfalse",
			"5da9b1f74c74793bb0b66ee3" : "https://api.europeana.eu/api/v2/thumbnail-by-url.json?size=w400&type=IMAGE&uri=http%3A%2F%2Fwww.dmg-lib.org%2Fdmglib%2Fhandler%3Ffile%3Dimages_001%2Fdmg00015598023_%2F_tn_350x231_dmg00015598023_.png.jpg",
			"5daee6f84c74793bb0b6ecfc" : "https://api.europeana.eu/api/v2/thumbnail-by-url.json?size=w400&type=IMAGE&uri=https%3A%2F%2Fwww.searchculture.gr%2Faggregator%2Fthumbnails%2Fedm-record%2FHOC%2F000062-11688_150033",
			"5daef7bb4c74793bb0b6fc6d" : "https://api.europeana.eu/api/v2/thumbnail-by-url.json?size=w400&type=IMAGE&uri=http%3A%2F%2Fwakefieldmuseumcollections.org.uk%2Fimages%2FD0003920.jpg",
			"5daeef524c74793bb0b6f61f" : "https://api.europeana.eu/api/v2/thumbnail-by-url.json?size=w400&type=IMAGE&uri=http%3A%2F%2Fcatalogue.jerseyheritage.org%2Fwp-content%2Fplugins%2Fadlib-interface%2Fadlib-image.php%3Fp%3D29797%26d%3Dcollect",
			"5da596b14c74792a9067cf4f" : "https://api.europeana.eu/api/v2/thumbnail-by-url.json?size=w400&type=IMAGE&uri=http%3A%2F%2Fwww.topfoto.co.uk%2Fimageflows%2Fimagepreview%2Ff%3DEU053053",
			"5da5a1da4c74792a9067e2eb" : "https://api.europeana.eu/api/v2/thumbnail-by-url.json?size=w400&type=IMAGE&uri=https%3A%2F%2Fapsida.cut.ac.cy%2Ffiles%2Foriginal%2Fee2c0871c669a0a4872c9efa7cb2cca4.tif",
			"5da5a5284c74792a9067ed7c" : "https://api.europeana.eu/api/v2/thumbnail-by-url.json?size=w400&type=IMAGE&uri=http%3A%2F%2Feuropeana.parisiennedephotographie.fr%2FSSEU%2FFiles%2F5268118eb27cad204606058bbf8170b7ca10ffd4f5a8417b1dd82eb950e55aa1",
			"5da5bdf54c74792a9067fd0b" : "https://api.europeana.eu/api/v2/thumbnail-by-url.json?size=w400&type=IMAGE&uri=https%3A%2F%2Fapsida.cut.ac.cy%2Ffiles%2Foriginal%2F7ba7c4642c878fbd86eeebd7d7283336.tif",
			"5da5c7fa4c74792a90680162" : "https://api.europeana.eu/api/v2/thumbnail-by-url.json?size=w400&type=IMAGE&uri=http%3A%2F%2Feuropeana.parisiennedephotographie.fr%2FSSEU%2FFiles%2Fe453675a51e7c0911a564b023709edec11f51127a7956d99d0ea25900ce63780",
			"5da5ce5d4c74792a9068055a" : "https://proxy.europeana.eu/2023872/museaalView_92248?api_url=https%3A%2F%2Fapi.europeana.eu%2Fapi&view=http%3A%2F%2Fwww.muis.ee%2FOAIService%2FImageServlet%3Fid%3D637155%26thumb%3Dfalse%26museaal%3Dfalse",
			"5da5d14f4c74792a90680baa" : "https://api.europeana.eu/api/v2/thumbnail-by-url.json?size=w400&type=IMAGE&uri=http%3A%2F%2Fwww.topfoto.co.uk%2Fimageflows%2Fimagepreview%2Ff%3DEU017577",
			"5da719914c74792a9068484f" : "https://api.europeana.eu/api/v2/thumbnail-by-url.json?size=w400&type=IMAGE&uri=http%3A%2F%2Fwww.topfoto.co.uk%2Fimageflows%2Fimagepreview%2Ff%3DEU018162",
			"5da71b454c74792a90684a7b" : "https://api.europeana.eu/api/v2/thumbnail-by-url.json?size=w400&type=IMAGE&uri=http%3A%2F%2Feuropeana.parisiennedephotographie.fr%2FSSEU%2FFiles%2F1c8b61b888266423136224c6caa4f83480be5fbe280b5355ba09a079803ea00f",
			"5da71db54c74792a90684d19" : "https://proxy.europeana.eu/2023872/museaalView_6228?api_url=https%3A%2F%2Fapi.europeana.eu%2Fapi&view=http%3A%2F%2Fwww.muis.ee%2FOAIService%2FImageServlet%3Fid%3D629377%26thumb%3Dfalse%26museaal%3Dfalse",
			"5da71e354c74792a90684e3b" : "https://api.europeana.eu/api/v2/thumbnail-by-url.json?size=w400&type=IMAGE&uri=http%3A%2F%2Feuropeana.parisiennedephotographie.fr%2FSSEU%2FFiles%2F25d7cd3cdf0107cc146cff17c0bffb7a42f72e8f4bface3980f1d9441964ad25"
		};
    if (data) {
      this.mediaType = 'VIDEO';
      this.loadData(data);
    }
  }

  loadData(data) {
    this.dbId = data.dbId;

    if (data.descriptiveData.label && data.descriptiveData.label.default) {
      this.title = data.descriptiveData.label.default.join(" and ");
    }
    if (data.descriptiveData.description && data.descriptiveData.description.default) {
      this.description = data.descriptiveData.description.default.join("</br>");
    }
    if (data.descriptiveData.description) {
      //data.descriptiveData.description = data.descriptiveData.description.default.join("</br>");
      this.alldescription = data.descriptiveData.description;
      this.descriptionlangs = [];
      let langs = Object.keys(this.alldescription);
      for (let i = 0; i < langs.length; i++) {
        //  if(langs[i]=="default" && langs.length>2){
        // 	 this.descriptionlangs.push({lang: langs[i], id: 'description-language-'+langs[i]});
        //  }
        if (langs[i] !== "default" && langs[i] !== "unknown") {
          if (this.description == this.alldescription[langs[i]]) {
            this.defaultlanguage = langs[i];
          }
          this.descriptionlangs.push({
            lang: langs[i],
            id: 'description-language-' + langs[i]
          });

        }
      }
    }
    this.annotations = data.annotationIds ? data.annotationIds : [];

    if (data.descriptiveData.creator) {
      this.creator = data.descriptiveData.creator;
    } else if (data.descriptiveData.dccreator) {
      if (data.descriptiveData.dccreator.default) {
        this.creator = data.descriptiveData.dccreator.default[0];
      }
    }
    //now try to read any remaining dc fields
    this.dcfields = [];
    for (let k in data.descriptiveData) {
      //alert(k);
      if ((k.startsWith('dc') && k.toLowerCase() != "dccreator") || k == "keywords") {
        var val = data.descriptiveData[k];
        var langsfield = [];
        var langs = Object.keys(val);
        var values = [];
        for (let i = 0; i < langs.length; i++) {
          if (langs[0] == "default" && langs.length <= 2) {
            if (langs[1] && langs[1] !== "unknown") {
              langsfield.push({
                lang: langs[1]
              });
            } else {
              langsfield.push({
                lang: 'default'
              });
            }
            values.push(val['default']);
            break;
          } else if (langs[i] !== "default" && langs[i] !== "unknown") {

            langsfield.push({
              lang: langs[i],
              id: k + '-language-' + langs[i]
            });
            values.push(val[langs[i]]);
          }
        }
        if (values.length > 0) {
          let newlabel = k;
          if (k == "keywords") {
            newlabel = "keywords";
          } else if (k.indexOf('dcterms') != -1) {
            newlabel = k.substring(7, k.length);
          } else {
            newlabel = k.substring(2, k.length);
          }
          let newdc = new Object({
            label: newlabel,
            value: values,
            langs: langsfield
          });
          this.dcfields.push(newdc);
        }
      }


    }

    if (!this.useFashionRepo) {
      this.thumbnail = data.media && data.media[0] && data.media[0].Thumbnail && data.media[0].Thumbnail.withUrl && data.media[0].Thumbnail.withUrl.length > 0 ? data.media[0].Thumbnail.withUrl : null;
      if (this.thumbnail) {
        if (!this.thumbnail.startsWith('http')) {
          this.thumbnail = `${settings.baseUrl}${this.thumbnail}`;
        }
      }
    }

    if (data.administrative && data.administrative.externalId) {
      this.externalId = data.administrative.externalId;
    }
    if (data.collectdIn) {
      this.collectedIn = data.collectedIn;
    }
    if (data.provenance) {
      this.source_uri = JsonUtils.findProvenanceValues(data.provenance, 'source_uri');
      if (this.source_uri.startsWith('record/')) {
        //replace with within link
        this.source_uri = '/#/item/' + this.dbId;
      }
      this.dataProvider = JsonUtils.findProvenanceValues(data.provenance, 'dataProvider');
      this.provider = JsonUtils.findProvenanceValues(data.provenance, 'provider');
      this.source = JsonUtils.findProvenanceValues(data.provenance, 'source');
    }

    if (data.usage) {
      this.likes = data.usage.likes;
      this.collected = data.usage.collected;
    }
    if (!this.useFashionRepo) {
			if (this.replaceImages[this.dbId] !== undefined) {
				this.myfullimg = this.replaceImages[this.dbId];
				this.thumbnail = this.myfullimg;
			} else {
      	this.fullres = data.media && data.media[0].Original && data.media[0].Original.withUrl && data.media[0].Original.withUrl.length > 0 ? data.media[0].Original.withUrl : null;
      	/*needs checking: do we search for withUrl or .url? doing both for now*/
      	if (!this.fullres || data.media[0].Original.type !== 'IMAGE') {
        	this.fullres = data.media && data.media[0].Original && data.media[0].Original.url ? data.media[0].Original.url : null;
      	}
      	this.medium = data.media && data.media[0].Medium && data.media[0].Medium.url ? data.media[0].Medium.url : null;
      	this.square = data.media && data.media[0].Square && data.media[0].Square.url ? data.media[0].Square.url : null;
      	this.tiny = data.media && data.media[0].Tiny && data.media[0].Tiny.url ? data.media[0].Tiny.url : null;
      	if (this.fullres) {
        	this.rights = JsonUtils.findResOrLit(data.media[0].Original.originalRights);
        	this.mediatype = data.media[0].Original.type;
      	} else if (this.thumbnail) {
        	this.rights = JsonUtils.findResOrLit(data.media[0].Thumbnail.originalRights);
        	this.mediatype = data.media[0].Thumbnail.type;
      	}
      	this.fullresLogic();
			}
    } else {
      this.myfullimg = data.descriptiveData.isShownBy;
      this.thumbnail = data.descriptiveData.isShownBy;
      if (this.myfullimg.includes("repos.europeanafashion.eu"))
        this.thumbnail = this.thumbnail + "?thumb=vertical";
      else if (this.myfullimg.includes("shoesornoshoes.com"))
        this.thumbnail = data.media[0].Thumbnail.url;
      if (data.descriptiveData.isShownAt.includes("trc-leiden.nl")) {
        if (this.myfullimg==="" || data.descriptiveData.isShownAt.includes("2003.0029")
        || data.descriptiveData.isShownAt.includes("2003.0030")
        || data.descriptiveData.isShownAt.includes("2007.0991")
        || data.descriptiveData.isShownAt.includes("2013.0172")) {
          if (data.media.length > 1 && !data.descriptiveData.isShownAt.includes("2003.0030")
              && !data.descriptiveData.isShownAt.includes("2007.0991")
              && !data.descriptiveData.isShownAt.includes("2013.0172")) {
            let mediaLength = data.media.length;
            this.myfullimg = data.media[1].Original.url;
          } else {
            let s = data.descriptiveData.isShownAt;
            let t = s.substring(s.lastIndexOf("TRC")+6);
            t = t.split(".")[0]+"/" + t;
            //if (t.includes("1052"))
            if (data.descriptiveData.isShownAt.includes("2003.0030"))
                this.myfullimg = "http://www.trc-leiden.nl/collection/collection_images/normal/" +t+".JPG";
              else if (data.descriptiveData.isShownAt.includes("2013.0172")) {
                t = t.slice(0, -1);
                this.myfullimg = "http://www.trc-leiden.nl/collection/collection_images/normal/" +t+"_3.JPG";
              }
              else
                this.myfullimg = "http://www.trc-leiden.nl/collection/collection_images/normal/" +t+"_2.JPG";
          }
        } else if ((data.descriptiveData.isShownAt.includes("2014")
          || data.descriptiveData.isShownAt.includes("2002.0017"))
          && !data.descriptiveData.isShownAt.includes("2014.0133")
          && !data.descriptiveData.isShownAt.includes("2014.0770")
          && !data.descriptiveData.isShownAt.includes("2014.0779")
          && !data.descriptiveData.isShownAt.includes("2014.0819")
          && !data.descriptiveData.isShownAt.includes("2014.0818")
          && !data.descriptiveData.isShownAt.includes("2014.0821")
          && !data.descriptiveData.isShownAt.includes("2014.1060")) {

          this.myfullimg = this.myfullimg.replace("jpg", "JPG");
        } else if (this.myfullimg.includes("; ") && !this.myfullimg.includes("c; d; e; ")) {
          this.myfullimg = this.myfullimg.split(";")[0] + ".jpg";
        }
        this.thumbnail = this.myfullimg.replace("normal", "thumb");
      } else if (data.descriptiveData.isShownAt.includes("carmentis.kmkg-mrah.be")) {
          this.myfullimg = data.media[0].Thumbnail.url;
          this.thumbnail = data.media[0].Thumbnail.url;
      }
    }

    this.loc = location.href.replace(location.hash, '') + '#/item/' + this.dbId;
    this.facebook = 'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(this.loc);
    this.twitter = 'https://twitter.com/share?url=' + encodeURIComponent(this.loc) + '&text=' + encodeURIComponent(this.title + ' on ' + window.location.host);
    this.mail = 'mailto:?subject=' + this.title + '&body=' + encodeURIComponent(this.loc);
    this.vtype = this.mediatype === 'VIDEO' || this.mediatype === 'AUDIO' ? 'MEDIA' : 'IMAGE';
    this.data = data;
    if (typeof this.data.descriptiveData.dccreator !== 'undefined') {
			if (typeof this.data.descriptiveData.dccreator.default !== 'undefined') {
				this.creator = this.data.descriptiveData.dccreator.default[0];
			}
      else if (typeof this.data.descriptiveData.dccreator.uri !== 'undefined') {
        this.creator = this.data.descriptiveData.dccreator.uri[0];
				let s1 = this.creator.split('/');
				this.creator = '<a href="'+ this.creator +'" target="_blank">'+ s1[s1.length-1] +'</a>';
      }
    }
  }

  getPinterest() {
    let url = encodeURIComponent(this.loc);

    let media = encodeURIComponent(this.fullresImage);
    let desc = encodeURIComponent(this.title + ' on ' + window.location.host);
    window.open('//www.pinterest.com/pin/create/button/' +
      '?url=' + url +
      '&media=' + media +
      '&description=' + desc, '', 'height=500,width=750');
    return false;
  }

  get Thumbnail() {
    if (this.thumbnail) {
      if (this.thumbnail.startsWith('http')) {
        return `${this.thumbnail}`;
      }
      return `${settings.baseUrl}${this.thumbnail}`;
    }
    return '/img/assets/img/ui/ic-noimage.png';
  }


  get ItemviewThumbnail() {
    if (this.thumbnail) {
      if (this.thumbnail.startsWith('http')) {
        return `${this.thumbnail}`;
      }
      return `${settings.baseUrl}${this.thumbnail}`;
    }
    return '/img/assets/img/loader.gif';
  }

  imageExists(image_url) {
    var http = new XMLHttpRequest();
    http.open('HEAD', image_url, false);
    http.send();
    console.log("status " + http.status);
    return http.status == 200;
  }


  getGlobal(url) {
    if (url) {
      if (url.startsWith('http')) {
        return url;
      }
      return settings.baseUrl + url;
    }
    return url;
  }

  getItemviewThumbnail() {
    if (this.data && this.thumbnail) {
      if (this.thumbnail.startsWith('http')) {
        return `${this.thumbnail}`;
      }
      return `${settings.baseUrl}${this.thumbnail}`;
    }
    return '/img/assets/img/loader.gif';
  }

  get fullresImage() {
    if (this.fullres) {
      if (this.fullres.startsWith('http')) {
        return `${this.fullres}`;
      }
      return `${settings.baseUrl}${this.fullres}`;
    }

    return this.ItemviewThumbnail;
  }


  get fullresExhImage() {
    if (this.fullres) {
      if (this.fullres.startsWith('http')) {
        return `${this.fullres}`;
      }
      return `${settings.baseUrl}${this.fullres}`;
    }

    return this.Thumbnail;
  }

  fullresLogic() {
    this.myfullimg = this.getGlobal('/img/assets/img/loader.gif');
    if (this.thumbnail) {
      this.checkThumbnail();
    }
    if (this.fullres) {
      this.checkFullress();
    }
  }
  checkFullress() {
    let self1 = this;
    // console.log("checking Fullres for "+this.title);
    let fr = this.getGlobal(this.fullres);
    this.checkImage(fr,
      function() {
        // console.log("Works Fullres for "+self1.title);
        // console.log("Works Fullres for "+fr);
        self1.myfullimg = fr;
        self1.imgworks = true;
      },
      function() {
        // console.log("Not working Fullres for "+self1.title);
        // console.log("Not working Fullres for "+fr);
        if (!self1.imgworks) {
          self1.myfullimg = self1.getGlobal('/img/assets/img/ui/ic-noimage.png');
          console.log("no images found");
        }
      }
    );
  }

  checkThumbnail() {
    // console.log("checking Thumbnail for "+this.title);
    let self1 = this;
    let th = self1.getGlobal(self1.thumbnail);
    self1.checkImage(th,
      function() {
        // console.log("Works Thumbnail for "+self1.title);
        // console.log("Works Thumbnail for "+th);
        self1.myfullimg = th;
        self1.imgworks = true;
      },
      function() {
        // console.log("Not working Thumbnail for "+self1.title);
        // console.log("Not working Thumbnail for "+th);

      }
    );
  }

  checkImage(imageSrc, good, bad) {
    // var img = new Image();
    // img.onload = good;
    // img.onerror = bad;
    // img.src = imageSrc;
    // 		$.ajax({
    //    url: imageSrc,
    //    success: function(data){
    //       good();
    //    },
    // 	 fail: function(data){
    // 		 console.log("call bad");
    //       bad();
    //    },
    //    timeout: 1000 //in milliseconds
    // });

    $.get(imageSrc)
      .done(good).fail(bad);
  }

  getFullresImage() {
    if (this.fullres) {
      if (this.fullres.startsWith('http')) {
        return `${this.fullres}`;
      }
      return `${settings.baseUrl}${this.fullres}`;
    }

    return this.getItemviewThumbnail();
  }

  get ShortTitle() {
    if (this.title)
      return this.title.replace(/^(.{100}[^\s]*).*/, "$1");
    else return "";
  }


  shortTitle() {
    if (this.title)
      return JsonUtils.truncate(this.title, 100, true);
    else return "";
  }


  get sourceCredits() {
    switch (this.source) {
      case 'DPLA':
        return 'dp.la';
      case 'Europeana':
        return 'europeana.eu';
      case 'NLA':
        return 'nla.gov.au';
      case 'DigitalNZ':
        return 'digitalnz.org';
      case 'Youtube':
        return 'youtube.com';
      case 'BritishLibrary':
        return 'www.bl.uk';
      case 'InternetArchive':
        return 'www.archive.org';
      case 'WITHin':
        return 'WITH';
      case 'WITHinASpace':
        return 'WITHinASpace';
      case 'Rijksmuseum':
        return 'www.rijksmuseum.nl';
      case "Historypin":
        return "www.historypin.com";
      case "DBPedia":
        return "dbpedia.com";
      case 'DDB':
        return 'deutsche-digitale-bibliothek.de';
      default:
        return '';
    }



  }

  getContextData() {
    if (this.data.contextData && this.data.contextData.body && !$.isEmptyObject(this.data.contextData.body)) {
      this.annotation = this.data.contextData.body.text.default;
      this.mediaUrl = this.data.contextData.body.mediaUrl;
      if (this.data.contextData.body.mediaType) {
        this.mediaType = this.data.contextData.body.mediaType;
      }
      this.mediaDescription = this.data.contextData.body.mediaDescription;
      this.textPosition = this.data.contextData.body.textPosition;
    }
  }

  get embeddedVideoUrl() {
    if (this.mediaUrl && this.mediaType && this.mediaType === 'VIDEO') {
      let regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|\?v=)([^#\&\?]*).*/;
      let match = this.mediaUrl.match(regExp);
      if (match && match[2].length === 11) {
        let embeddedVideoPath = 'https://www.youtube.com/embed/' + match[2];

        return embeddedVideoPath;
      }
    }
    return this.mediaUrl;
  }

  findValidImg(media) {
    for (let item of media) {
      if ('Original' in item) {
        return {original: item.Original.url, thumbnail: item.Thumbnail.url};
      }
    }
    for (let item of media) {
      if ('Thumbnail' in item) {
        return {original: item.Thumbnail.url, thumbnail: item.Thumbnail.url};
      }
    }
  }

}
