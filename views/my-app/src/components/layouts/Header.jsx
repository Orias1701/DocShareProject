import '../../assets/font-awesome-6.6.0-pro-full-main/css/all.css';
export default function Header() {
    return (
        <header>
        <div className="header-logo">
          <i className="fa-solid fa-code"></i>
        </div>
        <div className="header-search">
          <input type="text" placeholder="Search..." />
          <button>
            <i className="fa-regular fa-circle fa-beat-fade"></i>
          </button>
        </div>
        <div className="header-right">
          <div className="header-tools">
            <i className="fa-regular fa-shapes fa-shake"></i>
            <span></span>
          </div>
          <div className="header-info">
            <i className="fa-solid fa-blog" style={{ color: "#ff6a25" }}></i>
            <span>24</span>
          </div>
          <div className="header-info">
            <i className="fa-solid fa-user-check" style={{ color: "#9625ff" }}></i>
            <span>36</span>
          </div>
          <div className="header-user">
            <i className="fa-solid fa-circle-user"></i>
          </div>
        </div>
      </header>
    );
}