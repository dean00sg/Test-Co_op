// import { CardShowState } from '../state/cardshow';
// import { FetchNewsEvent, ToggleReadMoreEvent, NextCardEvent, PrevCardEvent } from '../event/cardshow';
// import { fetchNewsData } from '../repo/cardshow';
// import '../styles/cardshow.css';



// export class CardShowBloc {
//   constructor() {
//     this.state = new CardShowState();
//     this.eventHandlers = {
//       [FetchNewsEvent.type]: this.handleFetchNews.bind(this),
//       [ToggleReadMoreEvent.type]: this.handleToggleReadMore.bind(this),
//       [NextCardEvent.type]: this.handleNextCard.bind(this),
//       [PrevCardEvent.type]: this.handlePrevCard.bind(this),
//     };
//   }

//   async handleFetchNews() {
//     const newsData = await fetchNewsData();
//     this.state.newsData = newsData;
//   }

//   handleToggleReadMore(event) {
//     this.state.expandedCards[event.news_id] = !this.state.expandedCards[event.news_id];
//   }

//   handleNextCard() {
//     this.state.currentIndex = (this.state.currentIndex + 2) % this.state.newsData.length;
//   }

//   handlePrevCard() {
//     this.state.currentIndex = (this.state.currentIndex === 0) ? this.state.newsData.length - 2 : this.state.currentIndex - 2;
//   }

//   dispatch(event) {
//     const handler = this.eventHandlers[event.type];
//     if (handler) {
//       handler(event);
//     }
//   }
// }
