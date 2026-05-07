import React, { useEffect, useState } from 'react'
import { Button, Card, Col, Container, Modal, Row, Tab, Tabs } from 'react-bootstrap'
import { DoneRound, SpamIcon } from '../svgs'
import Loading from '../components/Loading'
import Moment from 'react-moment'
import * as XLSX from "xlsx"
import { getBookingImage, getBookings, updateBooking } from '../services/booking'

const Dashboard = () => {

    const [bookings, setBookings] = useState([])

    const [booking, setBooking] = useState({})

    const [showModal, setShowModal] = useState(false)

    const [bookingImages, setBookingImages] = useState({})

    const fetchBookings = () => {
        getBookings()
            .then((data) => {
                setBookings(data.data)
            })
    }

    const changeStatus = (id, status) => {
        updateBooking(id, { status })
            .then(() => {
                setBookings([...bookings.map(booking => {
                    if (booking._id === id) booking.status = status
                    return booking
                })])
            })
    }

    const openBooking = async (bkng, e) => {
        e.preventDefault()
        setBooking(bkng)
        setShowModal(true)
        if (!bookingImages[bkng._id]) {
            const data = await getBookingImage(bkng._id)
            setBookingImages({ ...bookingImages, [bkng._id]: data.data.file })
        }
    }

    const downloadData = () => {
        var ws = XLSX.utils.json_to_sheet(bookings);
        var wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "People");
        XLSX.writeFile(wb, `Bookings_${Date.now()}.xlsx`);
    }

    useEffect(() => {
        fetchBookings()
    }, [])


    return (
        <Container>
            <div className='position-fixed' style={{ bottom: 30, right: 30 }}>
                <Button variant='dark' onClick={() => downloadData()}>Export Data</Button>
            </div>
            <Row className='justify-content-center' style={{ position: 'relative' }}>
                <Col md={8} xs={12}>
                    <Tabs style={{ position: 'sticky', top: 70, zIndex: 50 }} defaultActiveKey="booked" className="mb-3">
                        <Tab eventKey="booked" title={<span>Booked Calls</span>}>
                            {
                                bookings.filter(booking => booking.status === 'BOOKED')
                                    .map((booking, i) =>
                                        <Card key={i} className="mb-2 shadow-sm">
                                            <Card.Body className='d-flex justify-content-between align-items-center'>
                                                <div><a href='/' style={{ textDecoration: 'none' }} onClick={(e) => openBooking(booking, e)}>{booking.name}</a></div>
                                                <div>
                                                    <Button size="sm" variant="primary" onClick={() => changeStatus(booking._id, 'SCHEDULED')}>Schedule</Button>
                                                    <span className='px-1'>{' '}</span>
                                                    <Button size="sm" variant="outline-danger" onClick={() => changeStatus(booking._id, 'SPAM')}>Spam</Button>
                                                </div>
                                            </Card.Body>
                                        </Card>
                                    )
                            }
                        </Tab>
                        <Tab eventKey="scheduled" title="Scheduled">
                            {
                                bookings.filter(booking => booking.status === 'SCHEDULED')
                                    .map((booking, i) =>
                                        <Card key={i} className="mb-2 shadow-sm">
                                            <Card.Body className='d-flex justify-content-between align-items-center'>
                                                <div><a href='/' style={{ textDecoration: 'none' }} onClick={(e) => openBooking(booking, e)}>{booking.name}</a></div>
                                                <div>
                                                    <Button size="sm" variant="success" onClick={() => changeStatus(booking._id, 'DONE')}>Done</Button>
                                                </div>
                                            </Card.Body>
                                        </Card>
                                    )
                            }
                        </Tab>
                        <Tab eventKey="done" title="Done">
                            {
                                bookings.filter(booking => booking.status === 'DONE')
                                    .map((booking, i) =>
                                        <Card key={i} className="mb-2 shadow-sm">
                                            <Card.Body className='d-flex justify-content-between align-items-center'>
                                                <div><a href='/' style={{ textDecoration: 'none' }} onClick={(e) => openBooking(booking, e)}>{booking.name}</a></div>
                                                <span><DoneRound style={{ width: 15 }} /></span>
                                            </Card.Body>
                                        </Card>
                                    )
                            }
                        </Tab>
                        <Tab eventKey="spam" title={<span className='text-danger'>Spam</span>}>
                            {
                                bookings.filter(booking => booking.status === 'SPAM')
                                    .map((booking, i) =>
                                        <Card key={i} className="mb-2 shadow-sm">
                                            <Card.Body className='d-flex justify-content-between align-items-center'>
                                                <div><a href='/' style={{ textDecoration: 'none' }} onClick={(e) => openBooking(booking, e)}>{booking.name}</a></div>
                                                <span><SpamIcon style={{ width: 15 }} /></span>
                                            </Card.Body>
                                        </Card>
                                    )
                            }
                        </Tab>
                    </Tabs>
                </Col>
            </Row>
            <Modal show={showModal} onHide={setShowModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Booking Details</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Row>
                        <Col md={5}>
                            <div className="py-2 text-right text-secondary">Name: </div>
                            <div className="py-2 text-right text-secondary">Email: </div>
                            <div className="py-2 text-right text-secondary">Phone: </div>
                            <div className="py-2 text-right text-secondary">Service: </div>
                            <div className="py-2 text-right text-secondary">Location: </div>
                            <div className="py-2 text-right text-secondary">Time of booking: </div>
                            <div className="py-2 text-right text-secondary">Payment Screenshot: </div>
                        </Col>
                        <Col md={7}>
                            <div className="py-2">{booking.name}</div>
                            <div className="py-2">{booking.email}</div>
                            <div className="py-2">{booking.phonenumber}</div>
                            <div className="py-2">{booking.servicetype}</div>
                            <div className="py-2">{booking.location}</div>
                            <div className="py-2"><Moment format='MMMM Do YYYY, HH:mm'>{booking.createdAt}</Moment></div>
                            <div className="py-2">
                                {
                                    bookingImages[booking._id] ?
                                        <img src={bookingImages[booking._id]} alt='Payment Screenshot' width={250} /> :
                                        <Loading size={20} />
                                }
                            </div>
                        </Col>
                    </Row>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    )
}

export default Dashboard