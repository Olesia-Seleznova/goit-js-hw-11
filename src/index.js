import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import Notiflix from 'notiflix';
import axios from 'axios';

const refs = {
  searchForm: document.querySelector('.search-form'),
  input: document.querySelector('.js-text'),
  gallery: document.querySelector('.gallery'),
  loadMore: document.querySelector('.load-more'),
};

const lightbox = new SimpleLightbox('.gallery a', {
  captionsData: 'alt',
  captionDelay: 250,
});

let page = 1;

refs.searchForm.addEventListener('submit', onSubmit);
refs.loadMore.addEventListener('click', onLoadMore);

async function onLoadMore() {
  page += 1;

  await fetchImages(page).then(data => {
    refs.gallery.insertAdjacentHTML('beforeend', createImagesMarkup(data.hits));
    lightbox.refresh();
    if (page >= Number(data.totalHits / 40)) {
      refs.loadMore.hidden = true;
      Notiflix.Notify.failure(
        "We're sorry, but you've reached the end of search results."
      );
    }
  });
  pageScroll();
}

function pageScroll() {
  const { height: cardHeight } = document
    .querySelector('.gallery')
    .firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}

async function onSubmit(evt) {
  evt.preventDefault();
  const inputContent = refs.input.value;
  if (inputContent === '') {
    return;
  }

  page = 1;

  try {
    const { hits, totalHits } = await fetchImages(page);
    refs.gallery.insertAdjacentHTML('beforeend', createImagesMarkup(hits));
    lightbox.refresh();

    if (page < Number(totalHits / 40)) {
      refs.loadMore.hidden = false;
      Notiflix.Notify.info(`Hooray! We found ${totalHits} images.`);
    }
  } catch {
    err => console.log(err);
  }

  async function fetchImages(page = 1) {
    const BASE_URL = 'https://pixabay.com/api/';
    const API_KEY = '38407139-ecc8ce3f4d9849c22fd8a553c';
    const inputContent = refs.input.value;

    const { data } = await axios.get(`${BASE_URL}`, {
      params: {
        key: `${API_KEY}`,
        q: `${inputContent}`,
        page: `${page}`,
        per_page: '40',
        image_type: 'photo',
        orientation: 'horizontal',
        safesearch: 'true',
      },
    });
    return data;
  }

  function createImagesMarkup(hits) {
    if (hits.length <= 0) {
      Notiflix.Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
    }
    return hits
      .map(
        ({
          webformatURL,
          largeImageURL,
          tags,
          likes,
          views,
          comments,
          downloads,
        }) => `<div class="photo-card">
         <a class="gallery-image" href="${largeImageURL}">
            <img src="${webformatURL}" alt="${tags}" class="image "loading="lazy" width="300"/>
         </a>
        <div class="info">
          <p class="info-item">
             <b>Likes: ${likes}</b>
          </p>
          <p class="info-item">
            <b>Views: ${views}</b>
          </p>
          <p class="info-item">
            <b>Comments: ${comments}</b>
          </p>
          <p class="info-item">
            <b>Downloads: ${downloads}</b>
          </p>
        </div>
        </div>`
      )
      .join('');
  }
}
