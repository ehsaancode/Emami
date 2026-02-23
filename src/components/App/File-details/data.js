
  export const settings = {
    dots: false,
    infinite: true,
    slidesToShow: 4,
    slidesToScroll: 1,
    autoplay: true,
    speed: 2000,
    arrows: true,
    autoplaySpeed: 2000,
    pauseOnHover: true,
    cssEase: "linear",
    responsive: [
      {
        breakpoint: 320,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          infinite: true,
          dots: false,
          speed: 3000,
          autoplay: true
        }
      },
      {
        breakpoint: 375,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          infinite: true,
          speed: 3000,
          autoplay: true
        }
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2,
          infinite: true,
          speed: 3000,
          autoplay: true
        }
      }
    ]

  };
  
export const images = [
    {
      id: "image1",
      className: "img-responsive br-5",
      src: new URL('../../../assets/img/media/1.jpg', import.meta.url).href,
      alt: "Thumb-2",
    },
    {
      id: "image2",
      className: "img-responsive br-5",
      src: new URL('../../../assets/img/media/2.jpg', import.meta.url).href,
      alt: "Thumb-2",
    },
    {
      id: "image3",
      className: "img-responsive br-5",
      src: new URL('../../../assets/img/media/3.jpg', import.meta.url).href,
      alt: "Thumb-2",
    },
    {
      id: "image4",
      className: "img-responsive br-5",
      src: new URL('../../../assets/img/media/4.jpg', import.meta.url).href,
      alt: "Thumb-2",
    },
    {
      id: "image5",
      className: "img-responsive br-5",
      src: new URL('../../../assets/img/media/5.jpg', import.meta.url).href,
      alt: "Thumb-2",
    },
    {
      id: "image6",
      className: "img-responsive br-5",
      src: new URL('../../../assets/img/media/6.jpg', import.meta.url).href,
      alt: "Thumb-2",
    },
    {
      id: "image7",
      className: "img-responsive br-5",
      src: new URL('../../../assets/img/media/7.jpg', import.meta.url).href,
      alt: "Thumb-2",
    },
    {
      id: "image8",
      className: "img-responsive br-5",
      src: new URL('../../../assets/img/media/8.jpg', import.meta.url).href,
      alt: "Thumb-2",
    },
  ];


    



