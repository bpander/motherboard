require([
    'MCarousel',
    'MCarouselTwo',
    'MForm',
    'MAjaxForm'
], function (
    MCarousel,
    MCarouselTwo,
    MForm,
    MAjaxForm
) {

    var carousel = document.getElementsByTagName('m-carousel')[0];
    document.body.addEventListener('test', function () {
        console.log('heard test event');
    });
    carousel.trigger('test', { foo: 'bar' });
    carousel.slidesVisible = '2';
    console.log('slidesVisible', carousel.slidesVisible);


    window.carousel = carousel;
});
