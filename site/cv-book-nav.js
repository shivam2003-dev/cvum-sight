(() => {
  const chapters = [
    ["cv-szeliski-1-introduction.html", "1. Introduction"],
    ["cv-szeliski-2-image-formation.html", "2. Image Formation"],
    ["cv-szeliski-3-image-processing.html", "3. Image Processing"],
    ["cv-szeliski-4-model-fitting-optimization.html", "4. Model Fitting and Optimization"],
    ["cv-szeliski-5-deep-learning.html", "5. Deep Learning"],
    ["cv-szeliski-6-recognition.html", "6. Recognition"],
    ["cv-szeliski-7-feature-detection-matching.html", "7. Feature Detection and Matching"],
    ["cv-szeliski-8-image-alignment-stitching.html", "8. Image Alignment and Stitching"],
    ["cv-szeliski-9-motion-estimation.html", "9. Motion Estimation"],
    ["cv-szeliski-10-computational-photography.html", "10. Computational Photography"],
    ["cv-szeliski-11-structure-from-motion-slam.html", "11. Structure from Motion and SLAM"],
    ["cv-szeliski-12-depth-estimation.html", "12. Depth Estimation"],
    ["cv-szeliski-13-3d-reconstruction.html", "13. 3D Reconstruction"],
    ["cv-szeliski-14-image-based-rendering.html", "14. Image-Based Rendering"],
    ["cv-szeliski-15-conclusion.html", "15. Conclusion"]
  ];
  const nav = document.querySelector("#cv-chapter-nav");
  if (!nav) return;
  const current = location.pathname.split("/").pop();
  for (const [href, label] of chapters) {
    const link = document.createElement("a");
    link.className = `toc-link${current === href ? " active" : ""}`;
    link.href = href;
    link.textContent = label;
    nav.appendChild(link);
  }
})();
