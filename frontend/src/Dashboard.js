import React, { Component } from 'react';
import {
  Button, TextField, Dialog, DialogActions, LinearProgress,
  DialogTitle, DialogContent, TableBody, Table,
  TableContainer, TableHead, TableRow, TableCell
} from '@material-ui/core';
import { Pagination } from '@material-ui/lab';
import swal from 'sweetalert';
const axios = require('axios');

export default class Dashboard extends Component {
  constructor() {
    super();
    this.state = {
      token: '',
      openvehicleModal: false,
      openvehicleEditModal: false,
      id: '',
      name: '',
      desc: '',
      price: '',
      Model: '',
      file: '',
      fileName: '',
      page: 1,
      search: '',
      vehicles: [],
      pages: 0,
      loading: false
    };
  }

  componentDidMount = () => {
    let token = localStorage.getItem('token');
    if (!token) {
      this.props.history.push('/login');
    } else {
      this.setState({ token: token }, () => {
        this.getvehicle();
      });
    }
  }

  getvehicle = () => {
    
    this.setState({ loading: true });

    let data = '?';
    data = `${data}page=${this.state.page}`;
    if (this.state.search) {
      data = `${data}&search=${this.state.search}`;
    }
    axios.get(`http://localhost:2000/get-vehicle${data}`, {
      headers: {
        'token': this.state.token
      }
    }).then((res) => {
      this.setState({ loading: false, vehicles: res.data.vehicles, pages: res.data.pages });
    }).catch((err) => {
      swal({
        text: err.response.data.errorMessage,
        icon: "error",
        type: "error"
      });
      this.setState({ loading: false, vehicles: [], pages: 0 },()=>{});
    });
  }

  deletevehicle = (id) => {
    axios.post('http://localhost:2000/delete-vehicle', {
      id: id
    }, {
      headers: {
        'Content-Type': 'application/json',
        'token': this.state.token
      }
    }).then((res) => {

      swal({
        text: res.data.title,
        icon: "success",
        type: "success"
      });

      this.setState({ page: 1 }, () => {
        this.pageChange(null, 1);
      });
    }).catch((err) => {
      swal({
        text: err.response.data.errorMessage,
        icon: "error",
        type: "error"
      });
    });
  }

  pageChange = (e, page) => {
    this.setState({ page: page }, () => {
      this.getvehicle();
    });
  }

  logOut = () => {
    localStorage.setItem('token', null);
    this.props.history.push('/');
  }

  onChange = (e) => {
    if (e.target.files && e.target.files[0] && e.target.files[0].name) {
      this.setState({ fileName: e.target.files[0].name }, () => { });
    }
    this.setState({ [e.target.name]: e.target.value }, () => { });
    if (e.target.name == 'search') {
      this.setState({ page: 1 }, () => {
        this.getvehicle();
      });
    }
  };

  addvehicle = () => {
    const fileInput = document.querySelector("#fileInput");
    const file = new FormData();
    file.append('file', fileInput.files[0]);
    file.append('name', this.state.name);
    file.append('desc', this.state.desc);
    file.append('Model', this.state.Model);
    file.append('price', this.state.price);

    axios.post('http://localhost:2000/add-vehicle', file, {
      headers: {
        'content-type': 'multipart/form-data',
        'token': this.state.token
      }
    }).then((res) => {

      swal({
        text: res.data.title,
        icon: "success",
        type: "success"
      });

      this.handlevehicleClose();
      this.setState({ name: '', desc: '', Model: '', price: '', file: null, page: 1 }, () => {
        this.getvehicle();
      });
    }).catch((err) => {
      swal({
        text: err.response.data.errorMessage,
        icon: "error",
        type: "error"
      });
      this.handlevehicleClose();
    });

  }

  updatevehicle = () => {
    const fileInput = document.querySelector("#fileInput");
    const file = new FormData();
    file.append('id', this.state.id);
    file.append('file', fileInput.files[0]);
    file.append('name', this.state.name);
    file.append('desc', this.state.desc);
    file.append('Model', this.state.Model);
    file.append('price', this.state.price);

    axios.post('http://localhost:2000/update-vehicle', file, {
      headers: {
        'content-type': 'multipart/form-data',
        'token': this.state.token
      }
    }).then((res) => {

      swal({
        text: res.data.title,
        icon: "success",
        type: "success"
      });

      this.handlevehicleEditClose();
      this.setState({ name: '', desc: '', Model: '', price: '', file: null }, () => {
        this.getvehicle();
      });
    }).catch((err) => {
      swal({
        text: err.response.data.errorMessage,
        icon: "error",
        type: "error"
      });
      this.handlevehicleEditClose();
    });

  }

  handlevehicleOpen = () => {
    this.setState({
      openvehicleModal: true,
      id: '',
      name: '',
      desc: '',
      price: '',
      Model: '',
      fileName: ''
    });
  };

  handlevehicleClose = () => {
    this.setState({ openvehicleModal: false });
  };

  handlevehicleEditOpen = (data) => {
    this.setState({
      openvehicleEditModal: true,
      id: data._id,
      name: data.name,
      desc: data.desc,
      price: data.price,
      Model: data.Model,
      fileName: data.image
    });
  };

  handlevehicleEditClose = () => {
    this.setState({ openvehicleEditModal: false });
  };

  render() {
    return (
      <div>
        {this.state.loading && <LinearProgress size={40} />}
        <div>
          <h2>Dashboard</h2>
          <Button
            className="button_style"
            variant="contained"
            color="primary"
            size="small"
            onClick={this.handlevehicleOpen}
          >
            Add vehicle
          </Button>
          <Button
            className="button_style"
            variant="contained"
            size="small"
            onClick={this.logOut}
          >
            Log Out
          </Button>
        </div>

        {/* Edit vehicle */}
        <Dialog
          open={this.state.openvehicleEditModal}
          onClose={this.handlevehicleClose}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">Edit vehicle</DialogTitle>
          <DialogContent>
            <TextField
              id="standard-basic"
              type="text"
              autoComplete="off"
              name="name"
              value={this.state.name}
              onChange={this.onChange}
              placeholder="vehicle Name"
              required
            /><br />
            <TextField
              id="standard-basic"
              type="text"
              autoComplete="off"
              name="desc"
              value={this.state.desc}
              onChange={this.onChange}
              placeholder="Description"
              required
            /><br />
            <TextField
              id="standard-basic"
              type="number"
              autoComplete="off"
              name="price"
              value={this.state.price}
              onChange={this.onChange}
              placeholder="Price"
              required
            /><br />
            <TextField
              id="standard-basic"
              type="number"
              autoComplete="off"
              name="Model"
              value={this.state.Model}
              onChange={this.onChange}
              placeholder="Model"
              required
            /><br /><br />
            
            {this.state.fileName}
          </DialogContent>

          <DialogActions>
            <Button onClick={this.handlevehicleEditClose} color="primary">
              Cancel
            </Button>
            <Button
              disabled={this.state.name == '' || this.state.desc == '' || this.state.Model == '' || this.state.price == ''}
              onClick={(e) => this.updatevehicle()} color="primary" autoFocus>
              Edit vehicle
            </Button>
          </DialogActions>
        </Dialog>

        {/* Add vehicle */}
        <Dialog
          open={this.state.openvehicleModal}
          onClose={this.handlevehicleClose}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">Add vehicle</DialogTitle>
          <DialogContent>
            <TextField
              id="standard-basic"
              type="text"
              autoComplete="off"
              name="name"
              value={this.state.name}
              onChange={this.onChange}
              placeholder="vehicle Name"
              required
            /><br />
            <TextField
              id="standard-basic"
              type="text"
              autoComplete="off"
              name="desc"
              value={this.state.desc}
              onChange={this.onChange}
              placeholder="Description"
              required
            /><br />
            <TextField
              id="standard-basic"
              type="number"
              autoComplete="off"
              name="price"
              value={this.state.price}
              onChange={this.onChange}
              placeholder="Price"
              required
            /><br />
            <TextField
              id="standard-basic"
              type="number"
              autoComplete="off"
              name="Model"
              value={this.state.Model}
              onChange={this.onChange}
              placeholder="Model"
              required
            /><br /><br />
            
            {this.state.fileName}
          </DialogContent>

          <DialogActions>
            <Button onClick={this.handlevehicleClose} color="primary">
              Cancel
            </Button>
            <Button
              disabled={this.state.name == '' || this.state.desc == '' || this.state.Model == '' || this.state.price == '' || this.state.file == null}
              onClick={(e) => this.addvehicle()} color="primary" autoFocus>
              Add vehicle
            </Button>
          </DialogActions>
        </Dialog>

        <br />

        <TableContainer>
          <TextField
            id="standard-basic"
            type="search"
            autoComplete="off"
            name="search"
            value={this.state.search}
            onChange={this.onChange}
            placeholder="Search by vehicle name"
            required
          />
          <Table aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell align="center">Name</TableCell>
                <TableCell align="center">Description</TableCell>
                <TableCell align="center">Price</TableCell>
                <TableCell align="center">Model</TableCell>
                <TableCell align="center">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {this.state.vehicles.map((row) => (
                <TableRow key={row.name}>
                  <TableCell align="center" component="th" scope="row">
                    {row.name}
                  </TableCell>
                  <TableCell align="center">{row.desc}</TableCell>
                  <TableCell align="center">{row.price}</TableCell>
                  <TableCell align="center">{row.Model}</TableCell>
                  <TableCell align="center">
                    <Button
                      className="button_style"
                      variant="outlined"
                      color="primary"
                      size="small"
                      onClick={(e) => this.handlevehicleEditOpen(row)}
                    >
                      Edit
                  </Button>
                    <Button
                      className="button_style"
                      variant="outlined"
                      color="secondary"
                      size="small"
                      onClick={(e) => this.deletevehicle(row._id)}
                    >
                      Delete
                  </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <br />
          <Pagination count={this.state.pages} page={this.state.page} onChange={this.pageChange} color="primary" />
        </TableContainer>

      </div>
    );
  }
}