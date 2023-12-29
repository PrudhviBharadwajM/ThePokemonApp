
exports.index = (req, res) => {
    res.render('../views/index');
};

exports.contact = (req, res) => {
    res.render('../views/partials/contact');
};

exports.about = (req, res) => {
    res.render('../views/partials/about');
};
