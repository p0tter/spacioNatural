import React from 'react'
import PropTypes from 'prop-types'

const Progress = ({percentage}) => {
    return (
        <div className="progress">
            <div className="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" aria-valuenow="75" aria-valuemin="0" aria-valuemax="100" 
            style={{width:`${percentage}%`}}>{percentage}%</div>
            
        </div>
    )
}

Progress.propTypes = {
    percentage: PropTypes.number.isRequired
}

export default Progress
