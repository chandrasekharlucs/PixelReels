import React, { useEffect, useState, useRef, useCallback } from "react";
const PEXELS_API_KEY = process.env.REACT_APP_PEXELS_API_KEY;
const PEXELS_API_URL = "https://api.pexels.com/videos/popular";
console.log(PEXELS_API_KEY);
function VideoFeed() {
  const [videos, setVideos] = useState([]);
  const [page, setPage] = useState(2);
  const [loading, setLoading] = useState(false);
  const observer = useRef();

  const fetchVideos = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${PEXELS_API_URL}?page=${page}&per_page=8`,
        {
          headers: {
            Authorization: PEXELS_API_KEY,
          },
          "Access-Control-Allow-Origin": "*",
        }
      );
      const data = await response.json();
      setVideos((prev) => [...prev, ...data.videos]);
    } catch (error) {
      console.error("Failed to fetch videos:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchVideos();
  }, [page]);

  const lastVideoRef = useCallback(
    (node) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          setPage((prev) => prev + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading]
  );
  useEffect(() => {
    const videoElements = document.querySelectorAll("video");

    const videoObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target;
          if (entry.isIntersecting) {
            // Only play if not already playing
            if (video.paused) {
              video.play().catch((error) => {
                console.log("Play interrupted:", error);
              });
            }
          } else {
            // Only pause if not already paused
            if (!video.paused) {
              video.pause();
            }
          }
        });
      },
      { threshold: 0.5 }
    ); // Play when 50% of video is visible

    videoElements.forEach((video) => {
      videoObserver.observe(video);
    });

    return () => {
      videoElements.forEach((video) => {
        videoObserver.unobserve(video);
      });
    };
  }, [videos]);

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "20px" }}>
      <h1 style={{ textAlign: "center" }}>Pexels Video Gallery</h1>
      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "20px" }}>
        {videos.map((video, index) => {
          const videoSrc =
            video.video_files.find(
              (file) => file.quality === "hd" || file.quality === "uhd"
            )?.link || video.video_files[0].link;
          if (videos.length === index + 1) {
            return (
              <>
                <div className="header">
                  <div className="circle">
                    <img
                      src={video.image}
                      alt=""
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        borderRadius: "50%",
                      }}
                    />
                  </div>
                </div>
                <video
                  key={video.id}
                  ref={lastVideoRef}
                  src={videoSrc}
                  controls
                  style={{ width: "100%" }}
                />
              </>
            );
          } else {
            return (
              <>
                <div className="header">
                  <div className="circle">
                    <img
                      src={video.image}
                      alt=""
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        borderRadius: "50%",
                      }}
                    />
                  </div>
                  <div>{video.user.name}</div>
                </div>
                <video
                  key={video.id}
                  src={videoSrc}
                  controls
                  style={{ width: "100%" }}
                />
              </>
            );
          }
        })}
      </div>
      {loading && <p style={{ textAlign: "center" }}>Loading more videos...</p>}
    </div>
  );
}

export default VideoFeed;
