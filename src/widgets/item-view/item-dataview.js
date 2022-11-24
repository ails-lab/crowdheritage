import { inject } from 'aurelia-framework';
import { Router } from 'aurelia-router';
import { I18N } from 'aurelia-i18n';
import { UserServices } from 'UserServices';
import { RecordServices } from 'RecordServices';

@inject(Router, I18N, UserServices, RecordServices)
export class ItemDataView {
  constructor(router, i18n, userServices, recordServices) {
    this.router = router;
    this.i18n = i18n;
    this.userServices = userServices;
    this.recordServices = recordServices;

    this.campaign = null;
    this.record = null;
    this.mediaDiv = '';

    this.previous = null;
    this.recId = '';
    this.loc = '';
  }

  activate(params) {
    this.loc = params.loc;
    this.campaign = params.campaign;
    this.record = params.record;
    this.records = params.records;
    this.previous = params.previous;
    this.collectionTitle = params.collectionTitle;

    this.recId = this.record.dbId;
    this.showMedia();
  }

  get isLiked() { return this.recordServices.isLiked(this.record.externalId);	}

  hasMotivation(name) {
    return !!this.campaign.motivation.includes(name);
  }

  openModal() {
    var modal = document.getElementById("myModal");
    var banner = document.getElementById("banner");
    modal.style.display = "block";
    banner.style.display = "none";
  }

  closeModal() {
    var modal = document.getElementById('myModal');
    var banner = document.getElementById("banner");
    banner.style.display = "block";
    modal.style.display = "none";
  }

  getValidImg(rec, alt) {
    if (this.campaign.username === 'garment-type' || this.campaign.username === 'garment-classification')
      return rec.myfullimg;
    else
      return alt;
  }

  toggleFullscreen(){
    var isInFullScreen = (document.fullscreenElement && document.fullscreenElement !== null) ||
    (document.webkitFullscreenElement && document.webkitFullscreenElement !== null) ||
    (document.mozFullScreenElement && document.mozFullScreenElement !== null) ||
    (document.msFullscreenElement && document.msFullscreenElement !== null);

    var docElm = document.documentElement;
    if (!isInFullScreen) {
      if (docElm.requestFullscreen) {
        docElm.requestFullscreen();
      } else if (docElm.mozRequestFullScreen) {
        docElm.mozRequestFullScreen();
      } else if (docElm.webkitRequestFullScreen) {
        docElm.webkitRequestFullScreen();
      } else if (docElm.msRequestFullscreen) {
        docElm.msRequestFullscreen();
      }
      screen.orientation.lock("landscape");
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
    }
  }

  likeRecord() {
    document.body.style.cursor = 'wait';
    if (this.isLiked) {
      this.recordServices.unlike(this.record.externalId)
        .then(() => {
          let index = this.userServices.current.favorites.indexOf(this.record.externalId);
          if (index > -1) {
            this.userServices.current.favorites.splice(index, 1);
            this.userServices.current.count.myFavorites -= 1;
          }
          document.body.style.cursor = 'default';
        })
        .catch(error => {
          toastr.error(error.message);
          document.body.style.cursor = 'default';
        });
    }
    else {
      this.recordServices.like(this.record.data)
        .then(() => {
          let index = this.userServices.current.favorites.indexOf(this.record.externalId);
          if (index == -1) {
            this.userServices.current.favorites.push(this.record.externalId);
            this.userServices.current.count.myFavorites += 1;
            document.body.style.cursor = 'default';
          }
        })
        .catch(error => {
          toastr.error(error.message);
          document.body.style.cursor = 'default';
        });
    }
  }

  previousItem() {
    // clear previous media
    this.mediaDiv = '';
	  let item = this.router.routes.find(x => x.name === 'item');
	  item.campaign = this.campaign;
		item.collection = this.collection;
	  item.records = this.records;
    item.previous = this.previous;
    this.records.unshift(this.record);
	  this.records.unshift(this.previous.shift());
    item.records = this.records;
		item.offset = this.offset + 1;
	  this.router.navigateToRoute('item', {cname: this.campaign.username, recid: this.records[0].dbId, lang: this.loc});
	}

  nextItem() {
    // clear previous media
    this.mediaDiv = '';
	  let item = this.router.routes.find(x => x.name === 'item');
	  item.campaign = this.campaign;
		item.collection = this.collection;
    this.previous.unshift(this.record);
    item.previous = this.previous;
	  item.records = this.records;
		item.offset = this.offset + 1;
	  this.router.navigateToRoute('item', {cname: this.campaign.username, recid: this.records[0].dbId, lang: this.loc});
  }

  checkURL(url) {
		if (url) {
      return(url.match(/\.(jpeg|jpg|gif|png)$/) != null);
    }
		return false;
	}

  showMedia() {
    if (this.record.source_uri && !this.checkURL(this.record.source_uri) && this.record.source_uri.indexOf('archives_items_') > -1) {
    	var id = this.record.source_uri.split("_")[2];
      this.mediaDiv = '<div><iframe id="mediaplayer" src="http://archives.crem-cnrs.fr/archives/items/'+id+'/player/346x130/" height="250px" scrolling="no" width="361px"></iframe></div>';
    }
    else if (this.record.mediatype=="WEBPAGE") {
      this.mediaDiv = '<div><iframe id="mediaplayer" src="'+this.record.fullresImage+'" width="100%" height="600px"></iframe></div>';
    }
    else {
    	if(this.record.mediatype=="VIDEO" && !this.checkURL(this.record.fullresImage)) {
        this.mediaDiv = '<video id="mediaplayer" controls width="576" height="324"><source src="' + this.record.fullresImage + '">Your browser does not support HTML5</video>';
    	}
    	else if(this.record.mediatype=="AUDIO"  && !this.checkURL(this.record.fullresImage)) {
    		if(this.record.thumbnail) {
          this.mediaDiv = '<div><img src="'+this.record.thumbnail+'" style="max-width:50%;"/></br></br></div><div><audio id="mediaplayer" controls width="576" height="324"><source src="' + this.record.fullresImage + '">Your browser does not support HTML5</audio></div>';
        }
        else {
          this.mediaDiv = '<div><img src="/img/assets/img/ui/ic-noimage.png" style="max-width:50%;"/></br></br></div><div><audio id="mediaplayer" controls width="576" height="324"><source src="' + this.record.fullresImage + '">Your browser does not support HTML5</audio>';
        }
      }
    }
  }
}
