const formidable = require('formidable');
const queryString = require('query-string');
const postModel = require('../models/postModel');
const { ObjectId } = require('mongodb');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: 'dpzszugjp',
    api_key: '163377278981499',
    api_secret: 'mQ8tpbcRdL84rx8Azz_VtCAJRZ0'
});

const ITEM_PER_PAGE = 10;
const categoriesCollection = require('../models/MongooseModel/categoriesMongooseModel');
const AllID = "5ff4814feb4a4a05dc5f4961";

function showUnsignedString(search) {
    var signedChars = "àảãáạăằẳẵắặâầẩẫấậđèẻẽéẹêềểễếệìỉĩíịòỏõóọôồổỗốộơờởỡớợùủũúụưừửữứựỳỷỹýỵÀẢÃÁẠĂẰẲẴẮẶÂẦẨẪẤẬĐÈẺẼÉẸÊỀỂỄẾỆÌỈĨÍỊÒỎÕÓỌÔỒỔỖỐỘƠỜỞỠỚỢÙỦŨÚỤƯỪỬỮỨỰỲỶỸÝỴ";
    var unsignedChars = "aaaaaaaaaaaaaaaaadeeeeeeeeeeeiiiiiooooooooooooooooouuuuuuuuuuuyyyyyAAAAAAAAAAAAAAAAADEEEEEEEEEEEIIIIIOOOOOOOOOOOOOOOOOUUUUUUUUUUUYYYYY";
    var input = search;
    var pattern = new RegExp("[" + signedChars + "]", "g");
    var output = input.replace(pattern, function(m, key, value) {
        return unsignedChars.charAt(signedChars.indexOf(m));
    });
    return output;
}
exports.renderPostsAdmin = async(req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const catid = req.query.catID;
    const search = req.query.txtSearch;
    var filter = {};
    if (search) {
        filter.titleUnsigned = new RegExp(showUnsignedString(search), 'i');
    }
    if (catid) {
        if (catid != ObjectId(AllID)) {
            filter.categoryID = ObjectId(catid);
        }
    }
    filter.isDeleted = false;
    filter.ownBy = "admin";

    const paginate = await postModel.listPost(filter, page, ITEM_PER_PAGE);
    const nextQuery = {...req.query, page: paginate.nextPage };
    const preQuery = {...req.query, page: paginate.prevPage };
    const category = await postModel.listCategory();
    var nameCategory = "";
    var id_category = "";
    if (catid) {
        const categoryTemp = await categoriesCollection.findOne({ _id: ObjectId(catid) });
        nameCategory = categoryTemp.nameCategory;
        id_category = ObjectId(catid);
    } else {
        nameCategory = "Thể loại";
        id_category = "";
    }
    res.render('./posts/postsAdmin', {
        title: 'Bài viết admin',
        posts: paginate.docs,
        category: category,
        id_category: id_category,
        nameCategory: nameCategory,
        totalDocs: paginate.totalDocs,
        //Phân trang
        hasNextPage: paginate.hasNextPage,
        nextPage: paginate.nextPage,
        nextPageQueryString: queryString.stringify(nextQuery),
        hasPreviousPage: paginate.hasPrevPage,
        prevPage: paginate.prevPage,
        prevPageQueryString: queryString.stringify(preQuery),
        lastPage: paginate.totalPages,
        ITEM_PER_PAGE: ITEM_PER_PAGE,
        currentPage: paginate.page
    });
};

exports.renderPostsUser = async(req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const catid = req.query.catID;
    const search = req.query.txtSearch;
    const stt = req.query.stt;
    var nameSort = "Tất cả";
    var filter = {};
    if (search) {
        filter.titleUnsigned = new RegExp(showUnsignedString(search), 'i');
    }
    if (catid) {
        if (catid != ObjectId(AllID)) {
            filter.categoryID = ObjectId(catid);
        }
    }
    if (stt) {
        if (stt === "2") {
            filter.status2 = "Đợi duyệt";
            nameSort = "Đợi duyệt";
        }
        if (stt === "3") {
            filter.status2 = "Đã duyệt";
            nameSort = "Đã duyệt";
        }
    }
    filter.isDeleted = false;
    filter.ownBy = "user";

    const paginate = await postModel.listPost(filter, page, ITEM_PER_PAGE);
    const nextQuery = {...req.query, page: paginate.nextPage };
    const preQuery = {...req.query, page: paginate.prevPage };
    const category = await postModel.listCategory();
    var nameCategory = "";
    var id_category = "";
    if (catid) {
        const categoryTemp = await categoriesCollection.findOne({ _id: ObjectId(catid) });
        nameCategory = categoryTemp.nameCategory;
        id_category = ObjectId(catid);
    } else {
        nameCategory = "Thể loại";
        id_category = "";
    }
    res.render('./posts/postsUser', {
        title: 'Bài viết user',
        posts: paginate.docs,
        category: category,
        id_category: id_category,
        nameCategory: nameCategory,
        totalDocs: paginate.totalDocs,
        //Phân trang
        hasNextPage: paginate.hasNextPage,
        nextPage: paginate.nextPage,
        nextPageQueryString: queryString.stringify(nextQuery),
        hasPreviousPage: paginate.hasPrevPage,
        prevPage: paginate.prevPage,
        prevPageQueryString: queryString.stringify(preQuery),
        lastPage: paginate.totalPages,
        ITEM_PER_PAGE: ITEM_PER_PAGE,
        currentPage: paginate.page,
        nameSort
    });
};

exports.renderAddPost = async(req, res, next) => {
    const category = await postModel.listCategory();
    res.render('./posts/addpost', { category, title: 'Thêm bài viết', fade: "fade" });
};

exports.add = async(req, res, next) => {
    const form = formidable({ multiples: true });

    form.parse(req, async(err, fields, files) => {
        if (err) {
            next(err);
            return;
        }
        const title = await postModel.checkTitle(showUnsignedString(fields.txtTitle).toLowerCase());
        if (!title) {
            return res.render('posts/addpost', {
                title: "Thêm bài viết",
                messageTitle: "Tên bài viết đã tồn tại, vui lòng vào update!",
                fade: "fade",
                txtTitle: fields.txtTitle,
                txtImagePath: fields.txtImagePath,
                txtImagePath_more: fields.txtImagePath_more,
                txtDescription: fields.txtDescription,
                txtDetail: fields.txtDetail,
                txtStatus: fields.txtStatus,
                txtCategory: fields.txtCategory,
                txtAuthor: fields.txtAuthor,

            });
        }
        const imageType = ["image/png", "image/jpeg"];
        const coverImage = files.txtImagePath;
        const listImage = files.txtImagePath_more;
        const arr = [];
        if (listImage && listImage.length > 0) {
            for (var i in listImage) {
                if (imageType.indexOf(listImage[i].type) === -1)
                    return res.render('posts/addpost', {
                        title: "Thêm bài viết",
                        messageImage: "Phải là file ảnh!",
                        fade: "fade",
                        txtTitle: fields.txtTitle,
                        txtImagePath: fields.txtImagePath,
                        txtImagePath_more: fields.txtImagePath_more,
                        txtDescription: fields.txtDescription,
                        txtDetail: fields.txtDetail,
                        txtStatus: fields.txtStatus,
                        txtCategory: fields.txtCategory,
                        txtAuthor: fields.txtAuthor,
                    });
            }
            for (var i in listImage) {
                cloudinary.uploader.upload(listImage[i].path, function(err, result) {
                    arr.push(result.url);
                }).then(() => {
                    if (arr.length === listImage.length) {
                        if (imageType.indexOf(coverImage.type) >= 0) {
                            cloudinary.uploader.upload(coverImage.path, function(err, result) {
                                fields.txtImagePath = result.url;
                                fields.txtImagePath_more = arr;
                                postModel.post(fields).then(() => {
                                    const category = postModel.listCategory();
                                    // Pass data to view to display list of books
                                    res.render('./posts/addpost', { category, title: 'Thêm bài viết', fade: "fade", err: "Thêm thành công!" });
                                });
                            });
                        } else {
                            return res.render('posts/addpost', {
                                title: "Thêm bài viết",
                                messageImage: "Phải là file ảnh!",
                                fade: "fade",
                                txtTitle: fields.txtTitle,
                                txtImagePath: fields.txtImagePath,
                                txtImagePath_more: fields.txtImagePath_more,
                                txtDescription: fields.txtDescription,
                                txtDetail: fields.txtDetail,
                                txtStatus: fields.txtStatus,
                                txtCategory: fields.txtCategory,
                                txtAuthor: fields.txtAuthor,
                            });
                        }
                    }
                });
            }
        } else {
            if (listImage && listImage.size > 0) {
                if (imageType.indexOf(listImage.type) >= 0) {
                    cloudinary.uploader.upload(listImage.path, function(err, result) {
                        fields.txtImagePath_more = result.url;
                    }).then(() => {
                        if (imageType.indexOf(coverImage.type) >= 0) {
                            cloudinary.uploader.upload(coverImage.path, function(err, result) {
                                fields.txtImagePath = result.url;

                                postModel.post(fields).then(() => {
                                    const category = postModel.listCategory();
                                    // Pass data to view to display list of books
                                    res.render('./posts/addpost', { category, title: 'Thêm bài viết', fade: "fade", err: "Thêm thành công!" });
                                });
                            });
                        } else {
                            return res.render('posts/addpost', {
                                title: "Thêm bài viết",
                                messageImage: "Phải là file ảnh!",
                                fade: "fade",
                                txtTitle: fields.txtTitle,
                                txtImagePath: fields.txtImagePath,
                                txtImagePath_more: fields.txtImagePath_more,
                                txtDescription: fields.txtDescription,
                                txtDetail: fields.txtDetail,
                                txtStatus: fields.txtStatus,
                                txtCategory: fields.txtCategory,
                                txtAuthor: fields.txtAuthor,
                            });
                        }
                    });
                } else {
                    return res.render('posts/addpost', {
                        title: "Thêm bài viết",
                        messageImage: "Phải là file ảnh!",
                        fade: "fade",
                        txtTitle: fields.txtTitle,
                        txtImagePath: fields.txtImagePath,
                        txtImagePath_more: fields.txtImagePath_more,
                        txtDescription: fields.txtDescription,
                        txtDetail: fields.txtDetail,
                        txtStatus: fields.txtStatus,
                        txtCategory: fields.txtCategory,
                        txtAuthor: fields.txtAuthor,
                    });
                }
            } else {
                if (imageType.indexOf(coverImage.type) >= 0) {
                    cloudinary.uploader.upload(coverImage.path, function(err, result) {
                        fields.txtImagePath = result.url;
                        postModel.post(fields).then(() => {
                            const category = postModel.listCategory();
                            // Pass data to view to display list of books
                            res.render('./posts/addpost', { category, title: 'Thêm bài viết', fade: "fade", err: "Thêm thành công!" });
                        });
                    });
                } else {
                    return res.render('posts/addpost', {
                        title: "Thêm bài viết",
                        messageImage: "Phải là file ảnh!",
                        fade: "fade",
                        txtTitle: fields.txtTitle,
                        txtImagePath: fields.txtImagePath,
                        txtImagePath_more: fields.txtImagePath_more,
                        txtDescription: fields.txtDescription,
                        txtDetail: fields.txtDetail,
                        txtStatus: fields.txtStatus,
                        txtCategory: fields.txtCategory,
                        txtAuthor: fields.txtAuthor,
                    });
                }
            }
        }
    });
};

exports.renderUpdatePost = async(req, res, next) => {
    const post = await postModel.get(req.params.id);
    res.render('./posts/updatepostAdmin', { post, title: 'Cập nhật sản phẩm', fade: "fade" });
};

exports.renderUpdatePost2 = async(req, res, next) => {
    const post = await postModel.get(req.params.id);
    res.render('./posts/updatepostUser', { post, title: 'Cập nhật sản phẩm', fade: "fade" });
};

exports.update = async(req, res, next) => {
    const form = formidable({ multiples: true });
    const post = await postModel.get(req.params.id);
    form.parse(req, async(err, fields, files) => {
        if (err) {
            next(err);
            return;
        }
        const title = await postModel.checkTitle_2(showUnsignedString(fields.txtTitle).toLowerCase(), req.params.id);
        //const title = 1;
        if (!title) {
            return res.render('posts/updatepostAdmin', {
                title: "Cập nhật bài viết",
                messageTitle: "Tên sách đã tồn tại, vui lòng vào update!",
                fade: "fade",
                post,
            });
        }
        const imageType = ["image/png", "image/jpeg"];
        const coverImage = files.txtImagePath;
        const listImage = files.txtImagePath_more;
        const arr = [];
        if (listImage && listImage.length > 0) {
            for (var i in listImage) {
                if (imageType.indexOf(listImage[i].type) === -1)
                    return res.render('posts/updatepostAdmin', {
                        title: "Cập nhật bài viết",
                        messageImage: "Phải là file ảnh!",
                        fade: "fade",
                        post,
                    });
            }
            for (var i in listImage) {
                cloudinary.uploader.upload(listImage[i].path, function(err, result) {
                    arr.push(result.url);
                }).then(() => {
                    if (arr.length === listImage.length) {
                        fields.txtImagePath_more = arr;
                        if (coverImage && coverImage.size > 0) {
                            if (imageType.indexOf(coverImage.type) >= 0) {
                                cloudinary.uploader.upload(coverImage.path, function(err, result) {
                                    fields.txtImagePath = result.url;
                                    postModel.update_1_1(fields, req.params.id).then(() => {
                                        return res.redirect('../../admin');
                                    });
                                });
                            } else {
                                return res.render('posts/updatepostAdmin', {
                                    title: "Cập nhật bài viết",
                                    messageImage: "Phải là file ảnh!",
                                    fade: "fade",
                                    post,
                                });
                            }
                        } else {
                            postModel.update_1_0(fields, req.params.id).then(() => {
                                return res.redirect('../../admin');
                            });
                        }
                    }
                });
            }
        } else {
            if (listImage && listImage.size > 0) {
                if (imageType.indexOf(listImage.type) >= 0) {
                    cloudinary.uploader.upload(listImage.path, function(err, result) {
                        fields.txtImagePath_more = result.url;
                    }).then(() => {
                        if (coverImage && coverImage.size > 0) {
                            if (imageType.indexOf(coverImage.type) >= 0) {
                                cloudinary.uploader.upload(coverImage.path, function(err, result) {
                                    fields.txtImagePath = result.url;
                                    postModel.update_1_1(fields, req.params.id).then(() => {
                                        return res.redirect('../../admin');
                                    });
                                });
                            } else {
                                return res.render('posts/updatepostAdmin', {
                                    title: "Cập nhật bài viết",
                                    messageImage: "Phải là file ảnh!",
                                    fade: "fade",
                                    post,
                                });
                            }
                        } else {
                            postModel.update_1_0(fields, req.params.id).then(() => {
                                return res.redirect('../../admin');
                            });
                        }

                    });
                } else {
                    return res.render('posts/updatepostAdmin', {
                        title: "Cập nhật bài viết",
                        messageImage: "Phải là file ảnh!",
                        fade: "fade",
                        post,
                    });
                }


            } else {
                if (coverImage && coverImage.size > 0) {
                    if (imageType.indexOf(coverImage.type) >= 0) {
                        cloudinary.uploader.upload(coverImage.path, function(err, result) {
                            fields.txtImagePath = result.url;
                            postModel.update_0_1(fields, req.params.id).then(() => {
                                return res.redirect('../../admin');
                            });
                        });
                    } else {
                        return res.render('posts/updatepostAdmin', {
                            title: "Cập nhật bài viết",
                            messageImage: "Phải là file ảnh!",
                            fade: "fade",
                            post,
                        });
                    }
                } else {
                    postModel.update_0_0(fields, req.params.id).then(() => {
                        return res.redirect('../../admin');
                    });
                }
            }
        }
        // Get books from model
    });
};

exports.update2 = async(req, res, next) => {
    const form = formidable({ multiples: true });
    const post = await postModel.get(req.params.id);
    form.parse(req, async(err, fields, files) => {
        if (err) {
            next(err);
            return;
        }
        const title = await postModel.checkTitle_2(showUnsignedString(fields.txtTitle).toLowerCase(), req.params.id);
        //const title = 1;
        if (!title) {
            return res.render('posts/updatepostUser', {
                title: "Cập nhật bài viết",
                messageTitle: "Tên sách đã tồn tại, vui lòng vào update!",
                fade: "fade",
                post,
            });
        }
        const imageType = ["image/png", "image/jpeg"];
        const coverImage = files.txtImagePath;
        const listImage = files.txtImagePath_more;
        const arr = [];
        if (listImage && listImage.length > 0) {
            for (var i in listImage) {
                if (imageType.indexOf(listImage[i].type) === -1)
                    return res.render('posts/updatepostUser', {
                        title: "Cập nhật bài viết",
                        messageImage: "Phải là file ảnh!",
                        fade: "fade",
                        post,
                    });
            }
            for (var i in listImage) {
                cloudinary.uploader.upload(listImage[i].path, function(err, result) {
                    arr.push(result.url);
                }).then(() => {
                    if (arr.length === listImage.length) {
                        fields.txtImagePath_more = arr;
                        if (coverImage && coverImage.size > 0) {
                            if (imageType.indexOf(coverImage.type) >= 0) {
                                cloudinary.uploader.upload(coverImage.path, function(err, result) {
                                    fields.txtImagePath = result.url;
                                    postModel.update_1_1_2(fields, req.params.id).then(() => {
                                        return res.redirect('../../user');
                                    });
                                });
                            } else {
                                return res.render('posts/updatepostUser', {
                                    title: "Cập nhật bài viết",
                                    messageImage: "Phải là file ảnh!",
                                    fade: "fade",
                                    post,
                                });
                            }
                        } else {
                            postModel.update_1_0_2(fields, req.params.id).then(() => {
                                return res.redirect('../../User');
                            });
                        }
                    }
                });
            }
        } else {
            if (listImage && listImage.size > 0) {
                if (imageType.indexOf(listImage.type) >= 0) {
                    cloudinary.uploader.upload(listImage.path, function(err, result) {
                        fields.txtImagePath_more = result.url;
                    }).then(() => {
                        if (coverImage && coverImage.size > 0) {
                            if (imageType.indexOf(coverImage.type) >= 0) {
                                cloudinary.uploader.upload(coverImage.path, function(err, result) {
                                    fields.txtImagePath = result.url;
                                    postModel.update_1_1_2(fields, req.params.id).then(() => {
                                        return res.redirect('../../user');
                                    });
                                });
                            } else {
                                return res.render('posts/updatepostUser', {
                                    title: "Cập nhật bài viết",
                                    messageImage: "Phải là file ảnh!",
                                    fade: "fade",
                                    post,
                                });
                            }
                        } else {
                            postModel.update_1_0_2(fields, req.params.id).then(() => {
                                return res.redirect('../../user');
                            });
                        }

                    });
                } else {
                    return res.render('posts/updatepostUser', {
                        title: "Cập nhật bài viết",
                        messageImage: "Phải là file ảnh!",
                        fade: "fade",
                        post,
                    });
                }


            } else {
                if (coverImage && coverImage.size > 0) {
                    if (imageType.indexOf(coverImage.type) >= 0) {
                        cloudinary.uploader.upload(coverImage.path, function(err, result) {
                            fields.txtImagePath = result.url;
                            postModel.update_0_1_2(fields, req.params.id).then(() => {
                                return res.redirect('../../user');
                            });
                        });
                    } else {
                        return res.render('posts/updatepostUser', {
                            title: "Cập nhật bài viết",
                            messageImage: "Phải là file ảnh!",
                            fade: "fade",
                            post,
                        });
                    }
                } else {
                    postModel.update_0_0_2(fields, req.params.id).then(() => {
                        return res.redirect('../../user');
                    });
                }
            }
        }
        // Get books from model
    });
};

exports.delete1 = async(req, res, next) => { //     // Get books from model
    await postModel.delete(req.params.id); //     // Pass data to view to display list of books
    res.redirect('../../admin');
};

exports.delete2 = async(req, res, next) => { //     // Get books from model
    await postModel.delete(req.params.id); //     // Pass data to view to display list of books
    res.redirect('../../user');
};

// exports.renderTop10 = async(req, res, next) => {
//     const filter = {};
//     filter.isDeleted = false;
//     const paginate = await postModel.listBookTop10(filter);

//     res.render('./products/top10', {
//         title: 'Top 10',
//         books: paginate.docs,
//     });
// };