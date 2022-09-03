import './css/styles.css';
import { fetchImages } from './fetch-images';
import { renderGallery } from './render-gallery';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import { scroll } from './scroll';
const simpleLightBox = new SimpleLightbox('.gallery a');

const searchForm = document.querySelector('#search-form');
const gallery = document.querySelector('.gallery');
const loadMoreBtn = document.querySelector('.btn-load-more');

let query = '';
let page = 1;
const perPage = 40;

searchForm.addEventListener('submit', onSearchForm);
loadMoreBtn.addEventListener('click', onLoadMoreBtn);

function onSearchForm(e) {
  e.preventDefault();
  window.scrollTo({ top: 0 });
  page = 1;
  query = e.currentTarget.searchQuery.value.trim();
  gallery.innerHTML = '';
  loadMoreBtn.classList.add('is-hidden');

  if (query === '') {
    alertEmptyQuery();
    return;
  }

  fetchImages(query, page, perPage)
    .then(({ data }) => {
      if (data.totalHits === 0) {
        alertNoQueryMatch();
      } else {
        renderGallery(data.hits);
        simpleLightBox.refresh();
        alertImagesFound(data);

        if (data.totalHits > perPage) {
          loadMoreBtn.classList.remove('is-hidden');
        }
      }
    })
    .catch(error => console.log(error));
}

function onLoadMoreBtn() {
  page += 1;
  simpleLightBox.destroy();

  fetchImages(query, page, perPage)
    .then(({ data }) => {
      renderGallery(data.hits);

      const totalPages = Math.ceil(data.totalHits / perPage);

      simpleLightBox.refresh();
      if (page === totalPages) {
        loadMoreBtn.classList.add('is-hidden');
        alertEndOfGalary();
      }
      scroll();
    })
    .catch(error => console.log(error));
}



function alertNoQueryMatch() {
  Notify.failure(
    'Sorry, there are no images matching your search query. Please try again.'
  );
}

function alertImagesFound(data) {
  Notify.success(`Hooray! We found ${data.totalHits} images.`);
}

function alertEmptyQuery() {
  Notify.info(
    'The search string cannot be empty. Please specify your search query.'
  );
}

function alertEndOfGalary() {
  Notify.warning("We're sorry, but you've reached the end of search results.");
}